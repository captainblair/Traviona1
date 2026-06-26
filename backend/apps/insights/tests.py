from django.test import TestCase

from apps.insights.models import Insight


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
