from django.db import models
from django.utils.text import slugify


class AboutPage(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='website/about/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class HomePage(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='website/home/', blank=True, null=True)
    primary_call_to_action_label = models.CharField(max_length=100, blank=True)
    primary_call_to_action_url = models.CharField(max_length=250, blank=True)
    secondary_call_to_action_label = models.CharField(max_length=100, blank=True)
    secondary_call_to_action_url = models.CharField(max_length=250, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Service(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class LeadershipMember(models.Model):
    full_name = models.CharField(max_length=200)
    role_title = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='website/leadership/', blank=True, null=True)
    linkedin_url = models.URLField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'full_name']

    def __str__(self):
        return self.full_name


class ContactInformation(models.Model):
    label = models.CharField(max_length=200, default='Main office')
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label


class GlobalPresence(models.Model):
    region = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'region']

    def __str__(self):
        return self.region
