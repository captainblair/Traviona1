from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class AuthSmokeTests(TestCase):
    def test_registration_endpoint_creates_user(self):
        response = self.client.post(reverse('register'), {
            'username': 'tester',
            'email': 'tester@example.com',
            'password': 'StrongPass123!',
            'first_name': 'Test',
            'last_name': 'User',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='tester').exists())

    def test_login_endpoint_returns_tokens(self):
        User.objects.create_user(username='loginuser', password='StrongPass123!')
        response = self.client.post(reverse('login'), {
            'username': 'loginuser',
            'password': 'StrongPass123!',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())

    def test_me_endpoint_requires_authentication(self):
        response = self.client.get(reverse('me'))
        self.assertEqual(response.status_code, 401)

    def test_admin_can_update_a_user_role(self):
        admin = User.objects.create_user(username='adminuser', password='StrongPass123!', role='admin')
        target = User.objects.create_user(username='targetuser', password='StrongPass123!')
        client = APIClient()
        client.force_authenticate(user=admin)
        response = client.patch(reverse('update-role', kwargs={'pk': target.pk}), {'role': 'recruiter'}, format='json')
        self.assertEqual(response.status_code, 200)
        target.refresh_from_db()
        self.assertEqual(target.role, 'recruiter')
