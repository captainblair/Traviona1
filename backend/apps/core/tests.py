from django.test import TestCase
from django.urls import reverse


class CoreSmokeTests(TestCase):
    def test_home_endpoint_returns_success_payload(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['project'], 'Traviona')
        self.assertEqual(response.json()['status'], 'ok')
