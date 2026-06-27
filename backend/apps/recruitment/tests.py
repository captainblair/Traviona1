from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.recruitment.models import JobApplication, JobPosting, TalentProfile
from apps.recruitment.services import sync_external_jobs

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
        created = sync_external_jobs([
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
