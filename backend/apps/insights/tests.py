from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.insights.models import Insight
from apps.insights.services import sync_external_insights
from apps.insights.tasks import sync_external_insights_task

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
        created = sync_external_insights([
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
        created = sync_external_insights_task([
            {
                'title': 'Task Imported Draft',
                'summary': 'Queued import',
                'source_name': 'GNews',
                'source_url': 'https://news.example/4',
            }
        ])

        self.assertEqual(created, 1)
        self.assertTrue(Insight.objects.filter(title='Task Imported Draft').exists())
