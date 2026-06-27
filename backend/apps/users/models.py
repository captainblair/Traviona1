from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('public', 'Public'),
        ('talent', 'Talent'),
        ('recruiter', 'Recruiter'),
        ('content_editor', 'Content Editor'),
        ('admin', 'Admin'),
    ]

    phone = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    headline = models.CharField(max_length=250, blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='public')
    mfa_secret = models.CharField(max_length=64, blank=True)
    mfa_enabled = models.BooleanField(default=False)
    social_provider = models.CharField(max_length=30, blank=True)
    social_uid = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.get_full_name() or self.username
