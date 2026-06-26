from django.conf import settings
from django.db import models
from django.utils.text import slugify


class JobPosting(models.Model):
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('remote', 'Remote'),
    ]

    title = models.CharField(max_length=250)
    slug = models.SlugField(unique=True, blank=True)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    employment_type = models.CharField(max_length=30, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    salary_range = models.CharField(max_length=100, blank=True)
    experience_level = models.CharField(max_length=100, blank=True)
    source_name = models.CharField(max_length=100, blank=True)
    source_url = models.URLField(blank=True)
    external_id = models.CharField(max_length=100, blank=True)
    raw_payload = models.JSONField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class TalentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    full_name = models.CharField(max_length=250)
    headline = models.CharField(max_length=250, blank=True)
    specialization = models.CharField(max_length=250, blank=True)
    location = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    cv_file = models.FileField(upload_to='recruitment/cvs/', blank=True, null=True)
    profile_photo = models.ImageField(upload_to='recruitment/profiles/', blank=True, null=True)
    years_experience = models.PositiveIntegerField(default=0)
    availability = models.CharField(max_length=100, blank=True)
    is_public = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class JobApplication(models.Model):
    job = models.ForeignKey(JobPosting, related_name='applications', on_delete=models.CASCADE)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='applications', on_delete=models.CASCADE)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=30, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f'{self.applicant} -> {self.job}'
