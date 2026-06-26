from django.test import TestCase

from apps.recruitment.models import JobPosting


class ExternalJobSyncTests(TestCase):
    def test_job_posting_can_store_external_api_metadata(self):
        job = JobPosting.objects.create(
            title='Senior Consultant',
            source_name='Greenhouse',
            source_url='https://jobs.example.com/123',
            external_id='gh-123',
            raw_payload={'id': 'gh-123', 'title': 'Senior Consultant'},
        )

        self.assertEqual(job.source_name, 'Greenhouse')
        self.assertEqual(job.external_id, 'gh-123')
        self.assertEqual(job.raw_payload['title'], 'Senior Consultant')
