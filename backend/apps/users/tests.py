from django.contrib.auth.tokens import default_token_generator
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from unittest.mock import patch
from rest_framework.test import APIClient

from apps.users.security import _totp_code

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

    def test_authenticated_user_can_update_profile(self):
        user = User.objects.create_user(username='profileuser', password='StrongPass123!')
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.patch(reverse('me'), {'headline': 'Strategy analyst'}, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.headline, 'Strategy analyst')

    def test_authenticated_user_can_change_password(self):
        user = User.objects.create_user(username='changepass', password='StrongPass123!')
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(reverse('password-change'), {
            'current_password': 'StrongPass123!',
            'new_password': 'EvenStrongerPass123!',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password('EvenStrongerPass123!'))

    def test_password_reset_confirm_updates_password(self):
        user = User.objects.create_user(username='resetuser', email='reset@example.com', password='StrongPass123!')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(reverse('password-reset-confirm'), {
            'uid': uid,
            'token': token,
            'new_password': 'ResetStrongPass123!',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password('ResetStrongPass123!'))

    def test_mfa_setup_enable_and_login_requires_code(self):
        user = User.objects.create_user(username='mfauser', password='StrongPass123!')
        client = APIClient()
        client.force_authenticate(user=user)

        setup_response = client.post(reverse('mfa-setup'))
        user.refresh_from_db()
        code = _totp_code(user.mfa_secret, int(__import__('time').time() // 30))
        enable_response = client.post(reverse('mfa-enable'), {'code': code}, format='json')
        missing_code_login = self.client.post(reverse('login'), {
            'username': 'mfauser',
            'password': 'StrongPass123!',
        }, format='json')
        valid_code_login = self.client.post(reverse('login'), {
            'username': 'mfauser',
            'password': 'StrongPass123!',
            'mfa_code': code,
        }, format='json')

        self.assertEqual(setup_response.status_code, 200)
        self.assertIn('otpauth_uri', setup_response.json())
        self.assertEqual(enable_response.status_code, 200)
        self.assertEqual(missing_code_login.status_code, 401)
        self.assertEqual(valid_code_login.status_code, 200)

    def test_social_login_creates_or_links_user(self):
        with patch('apps.users.views.fetch_social_profile') as fetch_profile:
            fetch_profile.return_value = {
                'uid': 'google-123',
                'email': 'social@example.com',
                'first_name': 'Social',
                'last_name': 'User',
            }
            response = self.client.post(reverse('social-login'), {
                'provider': 'google',
                'access_token': 'token',
            }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())
        user = User.objects.get(email='social@example.com')
        self.assertEqual(user.social_provider, 'google')
        self.assertEqual(user.social_uid, 'google-123')
