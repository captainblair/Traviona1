from django.test import TestCase
from django.urls import reverse

from apps.website.models import AboutPage, Service


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
