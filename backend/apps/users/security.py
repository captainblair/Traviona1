import base64
import hashlib
import hmac
import json
import secrets
import struct
import time
from urllib.request import Request, urlopen


def generate_mfa_secret():
    return base64.b32encode(secrets.token_bytes(20)).decode('ascii').rstrip('=')


def _totp_code(secret, time_step):
    padded_secret = secret + '=' * ((8 - len(secret) % 8) % 8)
    key = base64.b32decode(padded_secret, casefold=True)
    msg = struct.pack('>Q', time_step)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code = struct.unpack('>I', digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(code % 1000000).zfill(6)


def verify_totp(secret, code, window=1):
    if not secret or not code:
        return False
    current_step = int(time.time() // 30)
    return any(hmac.compare_digest(_totp_code(secret, current_step + offset), str(code)) for offset in range(-window, window + 1))


def build_otpauth_uri(user, secret, issuer='Traviona'):
    label = f'{issuer}:{user.email or user.username}'
    return f'otpauth://totp/{label}?secret={secret}&issuer={issuer}'


def fetch_google_profile(access_token):
    from django.conf import settings

    client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '') or ''
    tokeninfo_url = f'https://oauth2.googleapis.com/tokeninfo?access_token={access_token}'
    with urlopen(Request(tokeninfo_url), timeout=15) as response:
        token_data = json.loads(response.read().decode('utf-8'))

    if token_data.get('error'):
        raise ValueError(token_data.get('error_description') or token_data['error'])

    if client_id and token_data.get('aud') != client_id:
        raise ValueError('Google token audience mismatch')

    if token_data.get('email_verified') not in (True, 'true'):
        raise ValueError('Google email is not verified')

    request = Request(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
    )
    with urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))

    return {
        'uid': data.get('sub', '') or token_data.get('sub', ''),
        'email': data.get('email', '') or token_data.get('email', ''),
        'first_name': data.get('given_name', ''),
        'last_name': data.get('family_name', ''),
    }


def fetch_linkedin_profile(access_token):
    request = Request(
        'https://api.linkedin.com/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
    )
    with urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))
    return {
        'uid': data.get('sub', ''),
        'email': data.get('email', ''),
        'first_name': data.get('given_name', ''),
        'last_name': data.get('family_name', ''),
    }


def fetch_social_profile(provider, access_token):
    if provider == 'google':
        return fetch_google_profile(access_token)
    if provider == 'linkedin':
        return fetch_linkedin_profile(access_token)
    return {}
