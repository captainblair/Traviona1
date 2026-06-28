from django.test import TestCase
from django.urls import reverse

from apps.website.models import AboutPage, HomePage, HomePageSection, Service


class WebsitePublicEndpointTests(TestCase):
    def test_about_endpoint_returns_latest_active_page_without_authentication(self):
        AboutPage.objects.create(title='Old About', is_active=True)
        latest = AboutPage.objects.create(title='Traviona Consulting', summary='Global advisory', is_active=True)

        response = self.client.get(reverse('about-page'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], latest.id)
        self.assertEqual(response.json()['title'], 'Traviona Consulting')

    def test_service_list_is_public_and_only_returns_active_services(self):
        Service.objects.create(name='Risk Advisory', is_active=True)
        Service.objects.create(name='Hidden Service', is_active=False)

        response = self.client.get(reverse('service-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['name'], 'Risk Advisory')

    def test_home_endpoint_returns_active_sections_and_seo_fields(self):
        home = HomePage.objects.create(
            title='Traviona',
            subtitle='Global advisory',
            seo_title='Traviona Consulting',
            seo_description='Strategic consulting for complex markets.',
        )
        HomePageSection.objects.create(home_page=home, title='Advisory services', body='Practical support', display_order=1)
        HomePageSection.objects.create(home_page=home, title='Hidden section', is_active=False, display_order=2)

        response = self.client.get(reverse('home-page'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['seo_title'], 'Traviona Consulting')
        self.assertEqual(len(response.json()['sections']), 1)
        self.assertEqual(response.json()['sections'][0]['title'], 'Advisory services')

    def test_service_detail_returns_richer_content_and_seo_fields(self):
        service = Service.objects.create(
            name='Risk Advisory',
            short_description='Risk support',
            detailed_description='Detailed risk advisory support.',
            outcomes='Clear risk decisions',
            process='Assess, advise, support',
            seo_title='Risk Advisory Services',
            is_active=True,
        )

        response = self.client.get(reverse('service-detail', kwargs={'slug': service.slug}))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detailed_description'], 'Detailed risk advisory support.')
        self.assertEqual(response.json()['seo_title'], 'Risk Advisory Services')

    def test_assistant_config_is_public(self):
        response = self.client.get(reverse('assistant-config'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['name'], 'Traviona Assistant')
        self.assertIn(response.json()['mode'], {'local', 'ai'})
        self.assertGreaterEqual(len(response.json()['starter_questions']), 3)

    def test_assistant_chat_uses_local_fallback_without_api_key(self):
        response = self.client.post(
            reverse('assistant-chat'),
            data={'messages': [{'role': 'user', 'content': 'What services do you offer?'}]},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('text/event-stream', response['Content-Type'])
        body = b''.join(response.streaming_content).decode('utf-8')
        self.assertIn('Global St', body)
        self.assertIn('"done"', body)
