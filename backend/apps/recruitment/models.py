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
    slug = models.SlugField(max_length=250, unique=True, blank=True)
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
        self.slug = self._ensure_unique_slug(self.slug)
        super().save(*args, **kwargs)

    def _ensure_unique_slug(self, base_slug):
        slug = slugify(base_slug)[:240] or 'job'
        if not JobPosting.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            return slug

        for counter in range(2, 1000):
            candidate = f'{slug}-{counter}'
            if not JobPosting.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                return candidate

        return f'{slug}-{self.pk or "new"}'

    @staticmethod
    def slug_from_external_item(item, title=''):
        raw_payload = item.get('raw_payload') or {}
        if item.get('slug'):
            return slugify(item['slug'])[:240]
        if raw_payload.get('slug'):
            return slugify(raw_payload['slug'])[:240]

        external_id = item.get('external_id', '')
        if external_id.startswith('myjobmag:'):
            return slugify(external_id.removeprefix('myjobmag:'))[:240]

        source_url = item.get('source_url', '')
        if source_url:
            path_part = source_url.rstrip('/').rsplit('/', 1)[-1]
            path_slug = slugify(path_part)
            if path_slug:
                return path_slug[:240]

        return slugify(title)[:240] or 'job'

    def __str__(self):
        return self.title


class ExternalJobSource(models.Model):
    PROVIDER_CHOICES = [
        ('greenhouse', 'Greenhouse'),
        ('lever', 'Lever'),
        ('workable', 'Workable'),
        ('ashby', 'Ashby'),
        ('adzuna', 'Adzuna'),
        ('jooble', 'Jooble'),
        ('remoteok', 'Remote OK'),
        ('myjobmag', 'MyJobMag'),
        ('custom_json', 'Custom JSON'),
    ]

    name = models.CharField(max_length=120)
    provider = models.CharField(max_length=30, choices=PROVIDER_CHOICES, default='custom_json')
    endpoint_url = models.URLField()
    api_key_env = models.CharField(max_length=100, blank=True)
    api_secret_env = models.CharField(max_length=100, blank=True)
    default_location = models.CharField(max_length=200, blank=True)
    default_employment_type = models.CharField(max_length=30, choices=JobPosting.EMPLOYMENT_TYPE_CHOICES, default='full_time')
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


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
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewing', 'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    ]

    job = models.ForeignKey(JobPosting, related_name='applications', on_delete=models.CASCADE)
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='applications', on_delete=models.CASCADE)
    cover_letter = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f'{self.applicant} -> {self.job}'


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(JobApplication, related_name='status_history', on_delete=models.CASCADE)
    previous_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30, choices=JobApplication.STATUS_CHOICES)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='application_status_changes', on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.application_id}: {self.previous_status} -> {self.new_status}'


class RecruitmentNotification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('application_submitted', 'Application Submitted'),
        ('application_status_changed', 'Application Status Changed'),
        ('talent_verified', 'Talent Verified'),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='recruitment_notifications', on_delete=models.CASCADE)
    application = models.ForeignKey(JobApplication, related_name='notifications', on_delete=models.CASCADE, blank=True, null=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return self.title
