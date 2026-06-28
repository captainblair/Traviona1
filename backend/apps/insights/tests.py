from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch
from rest_framework.test import APIClient

from apps.insights.models import ExternalInsightSource, Insight, InsightAuthor, InsightCategory, InsightTag
from apps.insights.services import (
    _article_summary_and_content,
    _infer_category,
    parse_rss_feed,
    sync_configured_external_sources,
    sync_external_insights,
)
from apps.insights.tasks import sync_configured_external_insights_task, sync_external_insights_task

User = get_user_model()


class ExternalInsightSyncTests(TestCase):
    def test_insight_can_store_external_api_metadata(self):
        insight = Insight.objects.create(
            title='Global Trends',
            source_name='NewsAPI',
            source_url='https://news.example.com/456',
            external_id='news-456',
            raw_payload={'id': 'news-456', 'title': 'Global Trends'},
        )

        self.assertEqual(insight.source_name, 'NewsAPI')
        self.assertEqual(insight.external_id, 'news-456')
        self.assertEqual(insight.raw_payload['title'], 'Global Trends')


class InsightDraftPermissionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_published_insights_are_public(self):
        Insight.objects.create(
            title='Published article',
            summary='Visible summary',
            content='Visible content',
            is_published=True,
        )

        response = self.client.get(reverse('insight-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)

    def test_public_insight_list_supports_category_tag_and_search_filters(self):
        Insight.objects.create(
            title='Election security outlook',
            summary='Regional risk analysis',
            content='Election monitoring and civic trust',
            category='security',
            tags='elections,risk',
            is_published=True,
        )
        Insight.objects.create(
            title='Market briefing',
            summary='Economic update',
            content='Currency and trade analysis',
            category='economy',
            tags='markets',
            is_published=True,
        )

        response = self.client.get(reverse('insight-list'), {
            'category': 'security',
            'tag': 'elections',
            'q': 'trust',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['title'], 'Election security outlook')

    def test_non_editor_cannot_access_drafts(self):
        user = User.objects.create_user(username='talent', password='StrongPass123!')
        self.client.force_authenticate(user=user)

        response = self.client.get(reverse('insight-drafts'))

        self.assertEqual(response.status_code, 403)

    def test_content_editor_can_list_drafts(self):
        editor = User.objects.create_user(username='editor', password='StrongPass123!', role='content_editor')
        Insight.objects.create(title='Draft article', summary='Draft summary', content='Draft content', is_published=False)
        self.client.force_authenticate(user=editor)

        response = self.client.get(reverse('insight-drafts'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)

    def test_content_editor_can_create_and_update_editorial_draft(self):
        editor = User.objects.create_user(username='editor-create', password='StrongPass123!', role='content_editor')
        self.client.force_authenticate(user=editor)

        create_response = self.client.post(reverse('insight-drafts'), {
            'title': 'New draft',
            'summary': 'Draft summary',
            'content': 'Draft body',
            'category': 'politics',
            'source_name': 'Editorial Desk',
            'is_published': True,
        }, format='json')

        self.assertEqual(create_response.status_code, 201)
        insight = Insight.objects.get(title='New draft')
        self.assertFalse(insight.is_published)

        update_response = self.client.patch(reverse('insight-editorial-detail', kwargs={'slug': insight.slug}), {
            'summary': 'Updated summary',
            'tags': 'policy,analysis',
        }, format='json')

        self.assertEqual(update_response.status_code, 200)
        insight.refresh_from_db()
        self.assertEqual(insight.summary, 'Updated summary')
        self.assertEqual(insight.tags, 'policy,analysis')

    def test_content_editor_can_publish_draft(self):
        editor = User.objects.create_user(username='editor2', password='StrongPass123!', role='content_editor')
        insight = Insight.objects.create(title='Publishable article', summary='Summary', content='Content', is_published=False)
        self.client.force_authenticate(user=editor)

        response = self.client.post(reverse('insight-publish', kwargs={'slug': insight.slug}))

        self.assertEqual(response.status_code, 200)
        insight.refresh_from_db()
        self.assertTrue(insight.is_published)
        self.assertIsNotNone(insight.published_at)

    def test_content_editor_can_unpublish_article(self):
        editor = User.objects.create_user(username='editor-unpublish', password='StrongPass123!', role='content_editor')
        insight = Insight.objects.create(title='Published for unpublish', is_published=True)
        self.client.force_authenticate(user=editor)

        response = self.client.post(reverse('insight-unpublish', kwargs={'slug': insight.slug}))

        self.assertEqual(response.status_code, 200)
        insight.refresh_from_db()
        self.assertFalse(insight.is_published)

    def test_sync_external_insights_creates_posts_from_payload(self):
        created, _updated = sync_external_insights([
            {
                'title': 'Market Update',
                'summary': 'Latest analysis',
                'content': 'Detailed content',
                'source_name': 'NewsAPI',
                'source_url': 'https://news.example/2',
                'external_id': 'news-2',
            }
        ])

        self.assertEqual(created, 1)
        self.assertTrue(Insight.objects.filter(external_id='news-2').exists())

    def test_sync_external_insights_defaults_imports_to_drafts(self):
        sync_external_insights([
            {
                'title': 'Imported Draft',
                'summary': 'Needs editorial review',
                'source_name': 'NewsAPI',
                'source_url': 'https://news.example/3',
            }
        ])

        insight = Insight.objects.get(title='Imported Draft')
        self.assertFalse(insight.is_published)

    def test_sync_external_insights_task_returns_created_count(self):
        result = sync_external_insights_task([
            {
                'title': 'Task Imported Draft',
                'summary': 'Queued import',
                'source_name': 'GNews',
                'source_url': 'https://news.example/4',
                'external_id': 'gnews:task-4',
            }
        ])

        self.assertEqual(result['created'], 1)
        self.assertTrue(Insight.objects.filter(external_id='gnews:task-4').exists())

    def test_public_taxonomy_endpoints_return_categories_tags_and_authors(self):
        InsightCategory.objects.create(name='Security')
        InsightTag.objects.create(name='Elections')
        InsightAuthor.objects.create(name='Traviona Desk', title='Editorial team')

        category_response = self.client.get(reverse('insight-category-list'))
        tag_response = self.client.get(reverse('insight-tag-list'))
        author_response = self.client.get(reverse('insight-author-list'))

        self.assertEqual(category_response.status_code, 200)
        self.assertEqual(tag_response.status_code, 200)
        self.assertEqual(author_response.status_code, 200)
        self.assertEqual(category_response.json()['results'][0]['slug'], 'security')
        self.assertEqual(tag_response.json()['results'][0]['slug'], 'elections')
        self.assertEqual(author_response.json()['results'][0]['name'], 'Traviona Desk')

    def test_public_insight_list_supports_normalized_taxonomy_filters(self):
        category = InsightCategory.objects.create(name='Security')
        tag = InsightTag.objects.create(name='Elections')
        insight = Insight.objects.create(
            title='Normalized taxonomy article',
            summary='Election security',
            content='Election security analysis',
            category_ref=category,
            is_published=True,
            moderation_status='published',
        )
        insight.tag_refs.add(tag)

        response = self.client.get(reverse('insight-list'), {
            'category': 'security',
            'tag': 'elections',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['category_detail']['slug'], 'security')
        self.assertEqual(response.json()['results'][0]['tag_details'][0]['slug'], 'elections')

    def test_editor_can_update_moderation_status(self):
        editor = User.objects.create_user(username='moderator', password='StrongPass123!', role='content_editor')
        insight = Insight.objects.create(title='Moderated article', summary='Summary', content='Content')
        self.client.force_authenticate(user=editor)

        response = self.client.patch(reverse('insight-moderation-status', kwargs={'slug': insight.slug}), {
            'moderation_status': 'in_review',
            'moderation_notes': 'Ready for review',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        insight.refresh_from_db()
        self.assertEqual(insight.moderation_status, 'in_review')
        self.assertEqual(insight.moderation_notes, 'Ready for review')

    def test_editor_can_manage_external_insight_sources(self):
        editor = User.objects.create_user(username='source-editor', password='StrongPass123!', role='content_editor')
        category = InsightCategory.objects.create(name='Global Trends')
        tag = InsightTag.objects.create(name='Markets')
        self.client.force_authenticate(user=editor)

        response = self.client.post(reverse('insight-source-list'), {
            'name': 'Traviona RSS',
            'provider': 'rss',
            'endpoint_url': 'https://example.com/feed.xml',
            'default_category': category.id,
            'default_tags': [tag.id],
            'is_active': True,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        source = ExternalInsightSource.objects.get(name='Traviona RSS')
        self.assertEqual(source.default_category, category)
        self.assertEqual(source.default_tags.count(), 1)

    def test_rss_parser_maps_items_to_external_payloads(self):
        payloads = parse_rss_feed("""
            <rss><channel>
                <item>
                    <title>RSS Insight</title>
                    <link>https://news.example/rss-insight</link>
                    <description>RSS summary</description>
                </item>
            </channel></rss>
        """, source_name='Example RSS')

        self.assertEqual(len(payloads), 1)
        self.assertEqual(payloads[0]['title'], 'RSS Insight')
        self.assertEqual(payloads[0]['source_name'], 'Example RSS')

    def test_rss_parser_extracts_media_thumbnail(self):
        payloads = parse_rss_feed("""
            <rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
                <item>
                    <title>Image Story</title>
                    <link>https://news.example/rss-image</link>
                    <description>With image</description>
                    <media:thumbnail url="https://cdn.example/thumb.jpg" />
                </item>
            </channel></rss>
        """, source_name='Example RSS')

        self.assertEqual(payloads[0]['featured_image_url'], 'https://cdn.example/thumb.jpg')

    def test_rss_parser_strips_html_from_description(self):
        payloads = parse_rss_feed("""
            <rss><channel>
                <item>
                    <title>HTML Story</title>
                    <link>https://news.example/html-story</link>
                    <description><p>First paragraph.</p><ul><li>Point one</li><li>Point two</li></ul></description>
                </item>
            </channel></rss>
        """, source_name='Example RSS')

        self.assertEqual(payloads[0]['summary'], 'First paragraph.')
        self.assertIn('Point one', payloads[0]['content'])
        self.assertNotIn('<p>', payloads[0]['content'])

    def test_html_to_plain_text_strips_newsapi_truncation(self):
        summary, content = _article_summary_and_content(
            'Markets rally on strong earnings.',
            'Markets rally on strong earnings. [+120 chars]',
        )
        self.assertEqual(content, 'Markets rally on strong earnings.')

    def test_category_inference_detects_security_and_business_topics(self):
        self.assertEqual(_infer_category('Military strike near border', 'Conflict escalates', 'global_trends'), 'security')
        self.assertEqual(_infer_category('Markets rally on earnings', 'Stock market update', 'politics'), 'economy')
        self.assertEqual(_infer_category('Refugee crisis worsens', 'Humanitarian aid needed', 'politics'), 'human_rights')

    def test_sync_external_insights_applies_source_defaults(self):
        category = InsightCategory.objects.create(name='Economy')
        tag = InsightTag.objects.create(name='Markets')
        source = ExternalInsightSource.objects.create(
            name='Economy RSS',
            provider='rss',
            endpoint_url='https://example.com/economy.xml',
            default_category=category,
        )
        source.default_tags.add(tag)

        created, _updated = sync_external_insights([{
            'title': 'Source Default Article',
            'summary': 'Imported summary',
            'source_name': 'Economy RSS',
            'source_url': 'https://example.com/source-default',
            'external_id': 'rss:source-default',
        }], source=source)

        insight = Insight.objects.get(title='Source Default Article')
        self.assertEqual(created, 1)
        self.assertEqual(insight.category_ref, category)
        self.assertEqual(insight.tag_refs.first(), tag)
        self.assertTrue(insight.is_published)

    def test_sync_configured_external_sources_uses_active_sources(self):
        source = ExternalInsightSource.objects.create(
            name='Configured RSS',
            provider='rss',
            endpoint_url='https://example.com/configured.xml',
        )

        with patch('apps.insights.services.fetch_external_source_payloads') as fetch_payloads:
            fetch_payloads.return_value = [{
                'title': 'Configured Source Article',
                'summary': 'Fetched summary',
                'source_name': 'Configured RSS',
                'source_url': 'https://example.com/configured-article',
            }]
            created, _updated = sync_configured_external_sources()

        source.refresh_from_db()
        self.assertEqual(created, 1)
        self.assertIsNotNone(source.last_synced_at)
        self.assertTrue(Insight.objects.filter(title='Configured Source Article').exists())

    def test_configured_external_insights_task_runs_sync(self):
        with patch('apps.insights.tasks.sync_configured_external_sources') as sync_sources:
            sync_sources.return_value = (2, 3)

            result = sync_configured_external_insights_task()
            self.assertEqual(result, {'created': 2, 'updated': 3})
