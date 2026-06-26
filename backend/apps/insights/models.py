from django.db import models
from django.utils.text import slugify


class Insight(models.Model):
    CATEGORY_CHOICES = [
        ('politics', 'Politics'),
        ('economy', 'Economy'),
        ('security', 'Security'),
        ('human_rights', 'Human Rights'),
        ('global_trends', 'Global Trends'),
    ]

    title = models.CharField(max_length=250)
    slug = models.SlugField(unique=True, blank=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to='insights/', blank=True, null=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default='global_trends')
    author_name = models.CharField(max_length=200, blank=True)
    tags = models.CharField(max_length=500, blank=True)
    read_time_minutes = models.PositiveIntegerField(default=5)
    source_name = models.CharField(max_length=100, blank=True)
    source_url = models.URLField(blank=True)
    external_id = models.CharField(max_length=100, blank=True)
    raw_payload = models.JSONField(blank=True, null=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
