from django.db import models
from django.utils.text import slugify


class InsightCategory(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Insight categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class InsightTag(models.Model):
    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=250, unique=True, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class InsightAuthor(models.Model):
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='insights/authors/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ExternalInsightSource(models.Model):
    PROVIDER_CHOICES = [
        ('rss', 'RSS'),
        ('newsapi', 'NewsAPI'),
        ('gnews', 'GNews'),
    ]

    name = models.CharField(max_length=120)
    provider = models.CharField(max_length=30, choices=PROVIDER_CHOICES, default='rss')
    endpoint_url = models.URLField()
    api_key_env = models.CharField(max_length=100, blank=True)
    default_category = models.ForeignKey(InsightCategory, related_name='external_sources', on_delete=models.SET_NULL, blank=True, null=True)
    default_tags = models.ManyToManyField(InsightTag, blank=True)
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Insight(models.Model):
    CATEGORY_CHOICES = [
        ('politics', 'Politics'),
        ('economy', 'Economy'),
        ('security', 'Security'),
        ('human_rights', 'Human Rights'),
        ('global_trends', 'Global Trends'),
    ]
    MODERATION_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_review', 'In Review'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to='insights/', blank=True, null=True)
    featured_image_url = models.URLField(max_length=2048, blank=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default='global_trends')
    category_ref = models.ForeignKey(InsightCategory, related_name='insights', on_delete=models.SET_NULL, blank=True, null=True)
    tag_refs = models.ManyToManyField(InsightTag, related_name='insights', blank=True)
    author = models.ForeignKey(InsightAuthor, related_name='insights', on_delete=models.SET_NULL, blank=True, null=True)
    author_name = models.CharField(max_length=200, blank=True)
    tags = models.CharField(max_length=500, blank=True)
    read_time_minutes = models.PositiveIntegerField(default=5)
    source_name = models.CharField(max_length=100, blank=True)
    source_url = models.URLField(max_length=2048, blank=True)
    external_id = models.CharField(max_length=100, blank=True)
    raw_payload = models.JSONField(blank=True, null=True)
    moderation_status = models.CharField(max_length=30, choices=MODERATION_STATUS_CHOICES, default='draft')
    moderation_notes = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        self.slug = (self.slug or 'insight')[:250]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
