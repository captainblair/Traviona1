from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch
from rest_framework.test import APIClient

from apps.recruitment.models import ApplicationStatusHistory, ExternalJobSource, JobApplication, JobPosting, RecruitmentNotification, TalentProfile
from apps.recruitment.scrapers.myjobmag import _parse_listing_page, fetch_myjobmag_jobs
from apps.recruitment.services import fetch_custom_json_jobs, fetch_greenhouse_jobs, sync_configured_external_jobs, sync_external_jobs
from apps.recruitment.tasks import sync_configured_external_jobs_task, sync_external_jobs_task

User = get_user_model()


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

    def test_custom_json_fetcher_maps_generic_results(self):
        source = ExternalJobSource.objects.create(
            name='Custom Feed',
            provider='custom_json',
            endpoint_url='https://jobs.example.com/feed',
            default_location='Remote',
        )

        with patch('apps.recruitment.services._read_json_url') as read_json:
            read_json.return_value = {
                'results': [
                    {
                        'id': 'custom-1',
                        'title': 'Policy Analyst',
                        'description': 'Policy research role',
                        'url': 'https://jobs.example.com/custom-1',
                    }
                ]
            }
            payloads = fetch_custom_json_jobs(source)

        self.assertEqual(len(payloads), 1)
        self.assertEqual(payloads[0]['title'], 'Policy Analyst')
        self.assertEqual(payloads[0]['location'], 'Remote')
        self.assertEqual(payloads[0]['external_id'], 'custom-1')

    def test_greenhouse_fetcher_maps_jobs(self):
        source = ExternalJobSource.objects.create(
            name='Greenhouse Feed',
            provider='greenhouse',
            endpoint_url='https://boards.greenhouse.io/example/jobs',
        )

        with patch('apps.recruitment.services._read_json_url') as read_json:
            read_json.return_value = {
                'jobs': [
                    {
                        'id': 123,
                        'title': 'Senior Consultant',
                        'content': 'Consulting role',
                        'absolute_url': 'https://boards.greenhouse.io/example/jobs/123',
                        'location': {'name': 'Nairobi'},
                    }
                ]
            }
            payloads = fetch_greenhouse_jobs(source)

        self.assertEqual(payloads[0]['title'], 'Senior Consultant')
        self.assertEqual(payloads[0]['location'], 'Nairobi')
        self.assertEqual(payloads[0]['external_id'], '123')

    def test_myjobmag_parser_maps_listing_cards(self):
        html = """
        <ul class="job-list">
          <li>
            <h2><a href="/job/graphic-designer-people-foco-2">Graphic Designer at People Foco Agency LTD</a></h2>
            <ul>
              <li class="job-desc">Creative design role based in Nairobi.</li>
            </ul>
          </li>
        </ul>
        """
        payloads = _parse_listing_page(html, 'MyJobMag Kenya', 'Kenya', 'https://www.myjobmag.co.ke')

        self.assertEqual(len(payloads), 1)
        self.assertEqual(payloads[0]['title'], 'Graphic Designer')
        self.assertEqual(payloads[0]['raw_payload']['company'], 'People Foco Agency LTD')
        self.assertEqual(payloads[0]['location'], 'Kenya')
        self.assertEqual(payloads[0]['external_id'], 'myjobmag:graphic-designer-people-foco-2')
        self.assertTrue(payloads[0]['source_url'].endswith('/job/graphic-designer-people-foco-2'))

    def test_myjobmag_fetcher_uses_scraper(self):
        source = ExternalJobSource.objects.create(
            name='MyJobMag Kenya',
            provider='myjobmag',
            endpoint_url='https://www.myjobmag.co.ke/jobs?max_pages=1',
            default_location='Kenya',
        )

        with patch('apps.recruitment.scrapers.myjobmag.scrape_myjobmag_listings') as scrape:
            scrape.return_value = [
                {
                    'title': 'Software Engineer',
                    'summary': 'Tech role',
                    'description': 'Tech role',
                    'location': 'Kenya',
                    'employment_type': 'full_time',
                    'source_name': 'MyJobMag Kenya',
                    'source_url': 'https://www.myjobmag.co.ke/job/software-engineer',
                    'external_id': 'myjobmag:software-engineer',
                    'raw_payload': {},
                }
            ]
            payloads = fetch_myjobmag_jobs(source)

        self.assertEqual(len(payloads), 1)
        self.assertEqual(payloads[0]['external_id'], 'myjobmag:software-engineer')

    def test_sync_external_jobs_uses_unique_slugs_for_duplicate_titles(self):
        payloads = [
            {
                'title': 'Software Engineer',
                'summary': 'Role A',
                'external_id': 'myjobmag:software-engineer-a',
                'slug': 'software-engineer-a',
                'source_name': 'MyJobMag Kenya',
                'source_url': 'https://www.myjobmag.co.ke/job/software-engineer-a',
            },
            {
                'title': 'Software Engineer',
                'summary': 'Role B',
                'external_id': 'myjobmag:software-engineer-b',
                'slug': 'software-engineer-b',
                'source_name': 'MyJobMag Kenya',
                'source_url': 'https://www.myjobmag.co.ke/job/software-engineer-b',
            },
        ]

        created, _updated, _deactivated = sync_external_jobs(payloads)

        self.assertEqual(created, 2)
        slugs = list(JobPosting.objects.order_by('external_id').values_list('slug', flat=True))
        self.assertEqual(slugs, ['software-engineer-a', 'software-engineer-b'])

    def test_configured_external_job_sync_updates_source_timestamp(self):
        source = ExternalJobSource.objects.create(
            name='Configured Feed',
            provider='custom_json',
            endpoint_url='https://jobs.example.com/configured',
        )

        with patch('apps.recruitment.services.fetch_external_job_source_payloads') as fetch_payloads:
            fetch_payloads.return_value = [
                {
                    'title': 'Configured Job',
                    'summary': 'Imported role',
                    'source_url': 'https://jobs.example.com/configured-job',
                    'external_id': 'configured-1',
                }
            ]
            created, _updated, _deactivated = sync_configured_external_jobs()

        source.refresh_from_db()
        self.assertEqual(created, 1)
        self.assertIsNotNone(source.last_synced_at)
        self.assertTrue(JobPosting.objects.filter(external_id='configured-1').exists())

    def test_external_jobs_task_returns_created_count(self):
        result = sync_external_jobs_task([
            {
                'title': 'Task Job',
                'source_name': 'Task Feed',
                'source_url': 'https://jobs.example.com/task-job',
                'external_id': 'task-job-1',
            }
        ])

        self.assertEqual(result['created'], 1)
        self.assertTrue(JobPosting.objects.filter(external_id='task-job-1').exists())

    def test_configured_external_jobs_task_runs_sync(self):
        with patch('apps.recruitment.tasks.sync_configured_external_jobs') as sync_jobs:
            sync_jobs.return_value = (3, 2, 1)

            result = sync_configured_external_jobs_task()
            self.assertEqual(result, {'created': 3, 'updated': 2, 'deactivated': 1})


class RecruitmentPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_non_recruiter_cannot_create_job(self):
        user = User.objects.create_user(username='talent', password='StrongPass123!')
        self.client.force_authenticate(user=user)

        response = self.client.post(reverse('job-list'), {
            'title': 'Operations Analyst',
            'summary': 'A new role',
            'location': 'Remote',
        }, format='json')

        self.assertEqual(response.status_code, 403)

    def test_recruiter_can_create_job(self):
        recruiter = User.objects.create_user(username='recruiter', password='StrongPass123!', role='recruiter')
        self.client.force_authenticate(user=recruiter)

        response = self.client.post(reverse('job-list'), {
            'title': 'Operations Analyst',
            'summary': 'A new role',
            'location': 'Remote',
            'employment_type': 'full_time',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertTrue(JobPosting.objects.filter(title='Operations Analyst').exists())

    def test_recruiter_can_manage_external_job_sources(self):
        recruiter = User.objects.create_user(username='source-recruiter', password='StrongPass123!', role='recruiter')
        self.client.force_authenticate(user=recruiter)

        create_response = self.client.post(reverse('external-job-source-list'), {
            'name': 'Remote OK',
            'provider': 'remoteok',
            'endpoint_url': 'https://remoteok.com/api',
            'default_employment_type': 'remote',
            'is_active': True,
        }, format='json')
        list_response = self.client.get(reverse('external-job-source-list'))

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json()['results'][0]['provider'], 'remoteok')

    def test_non_recruiter_cannot_manage_external_job_sources(self):
        user = User.objects.create_user(username='not-source-recruiter', password='StrongPass123!')
        self.client.force_authenticate(user=user)

        response = self.client.get(reverse('external-job-source-list'))

        self.assertEqual(response.status_code, 403)

    def test_job_and_talent_lists_are_public(self):
        JobPosting.objects.create(title='Public Job', summary='Visible role')

        job_response = self.client.get(reverse('job-list'))
        talent_response = self.client.get(reverse('talent-list'))

        self.assertEqual(job_response.status_code, 200)
        self.assertEqual(talent_response.status_code, 200)

    def test_applicant_cover_letter_is_saved_on_apply(self):
        applicant = User.objects.create_user(username='coverletter', password='StrongPass123!')
        job = JobPosting.objects.create(title='Researcher', slug='researcher')
        self.client.force_authenticate(user=applicant)

        response = self.client.post(reverse('apply-to-job', kwargs={'job_id': job.pk}), {
            'cover_letter': 'I have relevant field research experience.',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        application = JobApplication.objects.get(job=job, applicant=applicant)
        self.assertEqual(application.cover_letter, 'I have relevant field research experience.')

    def test_user_cannot_view_another_users_application(self):
        applicant = User.objects.create_user(username='applicant-private', password='StrongPass123!')
        other_user = User.objects.create_user(username='other-user', password='StrongPass123!')
        job = JobPosting.objects.create(title='Private Application Job', slug='private-application-job')
        application = JobApplication.objects.create(job=job, applicant=applicant)
        self.client.force_authenticate(user=other_user)

        response = self.client.get(reverse('application-detail', kwargs={'pk': application.pk}))

        self.assertEqual(response.status_code, 403)

    def test_applicant_can_view_own_application(self):
        applicant = User.objects.create_user(username='applicant-owner', password='StrongPass123!')
        job = JobPosting.objects.create(title='Owned Application Job', slug='owned-application-job')
        application = JobApplication.objects.create(job=job, applicant=applicant)
        self.client.force_authenticate(user=applicant)

        response = self.client.get(reverse('application-detail', kwargs={'pk': application.pk}))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], application.id)

    def test_user_can_create_and_update_own_talent_profile(self):
        user = User.objects.create_user(username='newtalent', password='StrongPass123!')
        self.client.force_authenticate(user=user)

        create_response = self.client.post(reverse('my-talent-profile'), {
            'full_name': 'New Talent',
            'headline': 'Investigative researcher',
            'specialization': 'Human rights research',
            'location': 'Nairobi',
            'years_experience': 4,
            'is_public': True,
        }, format='json')

        self.assertEqual(create_response.status_code, 201)
        user.refresh_from_db()
        self.assertEqual(user.role, 'talent')

        update_response = self.client.patch(reverse('my-talent-profile'), {
            'headline': 'Senior investigative researcher',
            'is_verified': True,
        }, format='json')

        self.assertEqual(update_response.status_code, 200)
        profile = TalentProfile.objects.get(user=user)
        self.assertEqual(profile.headline, 'Senior investigative researcher')
        self.assertFalse(profile.is_verified)

    def test_user_cannot_create_second_talent_profile(self):
        user = User.objects.create_user(username='existingtalent', password='StrongPass123!', role='talent')
        TalentProfile.objects.create(user=user, full_name='Existing Talent')
        self.client.force_authenticate(user=user)

        response = self.client.post(reverse('my-talent-profile'), {
            'full_name': 'Duplicate Profile',
        }, format='json')

        self.assertEqual(response.status_code, 400)

    def test_recruiter_can_verify_talent_profile(self):
        recruiter = User.objects.create_user(username='profile-recruiter', password='StrongPass123!', role='recruiter')
        talent = User.objects.create_user(username='profile-talent', password='StrongPass123!', role='talent')
        profile = TalentProfile.objects.create(user=talent, full_name='Profile Talent')
        self.client.force_authenticate(user=recruiter)

        response = self.client.patch(reverse('talent-verify', kwargs={'pk': profile.pk}), {
            'is_verified': True,
        }, format='json')

        self.assertEqual(response.status_code, 200)
        profile.refresh_from_db()
        self.assertTrue(profile.is_verified)

    def test_non_recruiter_cannot_verify_talent_profile(self):
        user = User.objects.create_user(username='not-recruiter', password='StrongPass123!')
        talent = User.objects.create_user(username='verify-target', password='StrongPass123!', role='talent')
        profile = TalentProfile.objects.create(user=talent, full_name='Verify Target')
        self.client.force_authenticate(user=user)

        response = self.client.patch(reverse('talent-verify', kwargs={'pk': profile.pk}), {
            'is_verified': True,
        }, format='json')

        self.assertEqual(response.status_code, 403)

    def test_applicant_application_list_only_returns_their_applications(self):
        applicant = User.objects.create_user(username='list-applicant', password='StrongPass123!')
        other_user = User.objects.create_user(username='list-other', password='StrongPass123!')
        job = JobPosting.objects.create(title='List Job', slug='list-job')
        JobApplication.objects.create(job=job, applicant=applicant)
        JobApplication.objects.create(job=job, applicant=other_user)
        self.client.force_authenticate(user=applicant)

        response = self.client.get(reverse('application-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['applicant'], applicant.id)

    def test_recruiter_can_filter_applications_by_status_and_job(self):
        recruiter = User.objects.create_user(username='filter-recruiter', password='StrongPass123!', role='recruiter')
        applicant = User.objects.create_user(username='filter-applicant', password='StrongPass123!')
        first_job = JobPosting.objects.create(title='First Filter Job', slug='first-filter-job')
        second_job = JobPosting.objects.create(title='Second Filter Job', slug='second-filter-job')
        JobApplication.objects.create(job=first_job, applicant=applicant, status='shortlisted')
        JobApplication.objects.create(job=second_job, applicant=applicant, status='reviewing')
        self.client.force_authenticate(user=recruiter)

        response = self.client.get(reverse('application-list'), {
            'job': first_job.id,
            'status': 'shortlisted',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['job'], first_job.id)

    def test_sync_external_jobs_creates_posts_from_payload(self):
        created, _updated, _deactivated = sync_external_jobs([
            {
                'title': 'Data Analyst',
                'summary': 'A new opening',
                'location': 'London',
                'source_name': 'Greenhouse',
                'source_url': 'https://jobs.example/1',
                'external_id': 'gh-1',
            }
        ])

        self.assertEqual(created, 1)
        self.assertTrue(JobPosting.objects.filter(external_id='gh-1').exists())

    def test_job_list_supports_keyword_search(self):
        JobPosting.objects.create(title='Software Engineer', slug='software-engineer', summary='Build APIs', location='Kenya')
        JobPosting.objects.create(title='Tea Buyer', slug='tea-buyer', summary='Commodity role', location='Kenya')

        response = self.client.get(reverse('job-list'), {'search': 'software', 'page_size': 50})
        self.assertEqual(response.status_code, 200)
        titles = [item['title'] for item in response.json()['results']]
        self.assertIn('Software Engineer', titles)
        self.assertNotIn('Tea Buyer', titles)

    def test_job_list_experience_filter_matches_title_keywords(self):
        JobPosting.objects.create(
            title='Shop and Deliver - No Experience Required',
            slug='shop-no-experience',
            summary='Flexible shopper role',
            location='Feasterville',
            source_name='Adzuna United States',
        )
        JobPosting.objects.create(title='Senior Policy Analyst', slug='senior-policy-analyst', summary='Advisory role', location='Kenya')

        response = self.client.get(reverse('job-list'), {'experience_level': 'entry', 'page_size': 50})
        self.assertEqual(response.status_code, 200)
        titles = [item['title'] for item in response.json()['results']]
        self.assertIn('Shop and Deliver - No Experience Required', titles)
        self.assertNotIn('Senior Policy Analyst', titles)

    def test_job_list_location_united_states_matches_adzuna_source(self):
        JobPosting.objects.create(
            title='US Analyst',
            slug='us-analyst-location',
            source_name='Adzuna United States',
            location='Feasterville, Bucks County',
        )
        JobPosting.objects.create(
            title='Kenya Analyst',
            slug='kenya-analyst-location',
            source_name='MyJobMag Kenya',
            location='Kenya',
        )

        response = self.client.get(reverse('job-list'), {'location': 'united states', 'page_size': 50})
        self.assertEqual(response.status_code, 200)
        titles = [item['title'] for item in response.json()['results']]
        self.assertIn('US Analyst', titles)
        self.assertNotIn('Kenya Analyst', titles)

    def test_job_list_remote_employment_type_matches_remote_location(self):
        JobPosting.objects.create(
            title='Remote Research Consultant',
            slug='remote-research-consultant',
            location='Remote',
            employment_type='contract',
        )
        JobPosting.objects.create(
            title='Office Manager',
            slug='office-manager',
            location='Nairobi, Kenya',
            employment_type='full_time',
        )

        response = self.client.get(reverse('job-list'), {'employment_type': 'remote', 'page_size': 50})
        self.assertEqual(response.status_code, 200)
        titles = [item['title'] for item in response.json()['results']]
        self.assertIn('Remote Research Consultant', titles)
        self.assertNotIn('Office Manager', titles)

    def test_job_list_prioritizes_myjobmag_when_all_sources(self):
        JobPosting.objects.create(
            title='US Analyst',
            slug='us-analyst',
            source_name='Adzuna United States',
            location='New York',
        )
        JobPosting.objects.create(
            title='Nairobi Consultant',
            slug='nairobi-consultant',
            source_name='MyJobMag Kenya',
            location='Nairobi, Kenya',
        )

        response = self.client.get(reverse('job-list'), {'page_size': 50})
        self.assertEqual(response.status_code, 200)
        titles = [item['title'] for item in response.json()['results']]
        self.assertEqual(titles[0], 'Nairobi Consultant')

    def test_sync_deactivates_jobs_removed_from_external_source(self):
        source = ExternalJobSource.objects.create(
            name='MyJobMag Kenya',
            provider='myjobmag',
            endpoint_url='https://www.myjobmag.co.ke/jobs',
        )
        JobPosting.objects.create(
            title='Old Role',
            slug='old-role',
            source_name='MyJobMag Kenya',
            external_id='myjobmag:old-role',
            is_active=True,
        )
        JobPosting.objects.create(
            title='Current Role',
            slug='current-role',
            source_name='MyJobMag Kenya',
            external_id='myjobmag:current-role',
            is_active=True,
        )

        _created, _updated, deactivated = sync_external_jobs(
            [
                {
                    'title': 'Current Role',
                    'summary': 'Still live',
                    'source_name': 'MyJobMag Kenya',
                    'source_url': 'https://www.myjobmag.co.ke/job/current-role',
                    'external_id': 'myjobmag:current-role',
                }
            ],
            source=source,
        )

        self.assertEqual(deactivated, 1)
        self.assertFalse(JobPosting.objects.get(external_id='myjobmag:old-role').is_active)
        self.assertTrue(JobPosting.objects.get(external_id='myjobmag:current-role').is_active)

    def test_recruiter_can_update_application_status(self):
        recruiter = User.objects.create_user(username='recruiter2', password='StrongPass123!', role='recruiter')
        applicant = User.objects.create_user(username='applicant', password='StrongPass123!')
        job = JobPosting.objects.create(title='Consultant', slug='consultant')
        application = JobApplication.objects.create(job=job, applicant=applicant)
        self.client.force_authenticate(user=recruiter)

        response = self.client.patch(reverse('application-detail', kwargs={'pk': application.pk}), {
            'status': 'reviewing',
            'notes': 'Strong profile',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.status, 'reviewing')
        self.assertEqual(application.notes, 'Strong profile')

    def test_talent_list_supports_search_and_profile_filters(self):
        TalentProfile.objects.create(
            full_name='Amina Researcher',
            specialization='Human rights research',
            location='Nairobi',
            years_experience=7,
            availability='Immediate',
            is_verified=True,
            is_public=True,
        )
        TalentProfile.objects.create(
            full_name='Hidden Match',
            specialization='Human rights research',
            location='London',
            years_experience=2,
            availability='Later',
            is_verified=False,
            is_public=True,
        )

        response = self.client.get(reverse('talent-list'), {
            'specialization': 'rights',
            'location': 'Nairobi',
            'availability': 'Immediate',
            'min_experience': 5,
            'is_verified': 'true',
            'q': 'Amina',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['full_name'], 'Amina Researcher')

    def test_application_status_update_creates_history_and_notification(self):
        recruiter = User.objects.create_user(username='history-recruiter', password='StrongPass123!', role='recruiter')
        applicant = User.objects.create_user(username='history-applicant', password='StrongPass123!')
        job = JobPosting.objects.create(title='History Consultant', slug='history-consultant')
        application = JobApplication.objects.create(job=job, applicant=applicant)
        self.client.force_authenticate(user=recruiter)

        response = self.client.patch(reverse('application-detail', kwargs={'pk': application.pk}), {
            'status': 'shortlisted',
            'notes': 'Good fit',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(ApplicationStatusHistory.objects.filter(application=application, previous_status='submitted', new_status='shortlisted').exists())
        self.assertTrue(RecruitmentNotification.objects.filter(recipient=applicant, notification_type='application_status_changed').exists())
        self.assertEqual(response.json()['status_history'][0]['new_status'], 'shortlisted')

    def test_applying_creates_submission_history_and_notification(self):
        applicant = User.objects.create_user(username='notify-applicant', password='StrongPass123!')
        job = JobPosting.objects.create(title='Notification Job', slug='notification-job')
        self.client.force_authenticate(user=applicant)

        response = self.client.post(reverse('apply-to-job', kwargs={'job_id': job.pk}), {
            'cover_letter': 'Ready to contribute.',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        application = JobApplication.objects.get(job=job, applicant=applicant)
        self.assertTrue(ApplicationStatusHistory.objects.filter(application=application, new_status='submitted').exists())
        self.assertTrue(RecruitmentNotification.objects.filter(recipient=applicant, notification_type='application_submitted').exists())

    def test_recruiter_dashboard_returns_summary_counts(self):
        recruiter = User.objects.create_user(username='dashboard-recruiter', password='StrongPass123!', role='recruiter')
        applicant = User.objects.create_user(username='dashboard-applicant', password='StrongPass123!')
        job = JobPosting.objects.create(title='Dashboard Job', slug='dashboard-job')
        JobApplication.objects.create(job=job, applicant=applicant, status='reviewing')
        TalentProfile.objects.create(user=applicant, full_name='Dashboard Talent', is_verified=True)
        self.client.force_authenticate(user=recruiter)

        response = self.client.get(reverse('recruitment-dashboard'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['active_jobs'], 1)
        self.assertEqual(response.json()['applications_by_status']['reviewing'], 1)
        self.assertEqual(response.json()['verified_talent_profiles'], 1)

    def test_user_can_list_and_mark_own_notifications_read(self):
        applicant = User.objects.create_user(username='notification-owner', password='StrongPass123!')
        job = JobPosting.objects.create(title='Notification Owner Job', slug='notification-owner-job')
        application = JobApplication.objects.create(job=job, applicant=applicant)
        notification = RecruitmentNotification.objects.create(
            recipient=applicant,
            application=application,
            notification_type='application_status_changed',
            title='Status changed',
        )
        self.client.force_authenticate(user=applicant)

        list_response = self.client.get(reverse('recruitment-notification-list'))
        update_response = self.client.patch(reverse('recruitment-notification-detail', kwargs={'pk': notification.pk}), {
            'is_read': True,
        }, format='json')

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()['results']), 1)
        self.assertEqual(update_response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
