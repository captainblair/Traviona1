from django.db import models
from django.utils.text import slugify


class AboutPage(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='website/about/', blank=True, null=True)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    seo_keywords = models.CharField(max_length=300, blank=True)
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
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    seo_keywords = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class HomePageSection(models.Model):
    SECTION_TYPE_CHOICES = [
        ('overview', 'Overview'),
        ('service_highlight', 'Service Highlight'),
        ('stat', 'Stat'),
        ('testimonial', 'Testimonial'),
        ('call_to_action', 'Call to Action'),
        ('custom', 'Custom'),
    ]

    home_page = models.ForeignKey(HomePage, related_name='sections', on_delete=models.CASCADE)
    section_type = models.CharField(max_length=40, choices=SECTION_TYPE_CHOICES, default='custom')
    eyebrow = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    image = models.ImageField(upload_to='website/home/sections/', blank=True, null=True)
    link_label = models.CharField(max_length=100, blank=True)
    link_url = models.CharField(max_length=250, blank=True)
    metadata = models.JSONField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.title


class Service(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    detailed_description = models.TextField(blank=True)
    outcomes = models.TextField(blank=True)
    process = models.TextField(blank=True)
    icon_name = models.CharField(max_length=100, blank=True)
    featured_image = models.ImageField(upload_to='website/services/', blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True, help_text='Optional structured content: image, benefits, whyChoose, ctaHref, etc.')
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    seo_keywords = models.CharField(max_length=300, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'name']

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


class ContactEnquiry(models.Model):
    TOPIC_CHOICES = [
        ('general', 'General enquiry'),
        ('advisory', 'Advisory services'),
        ('careers', 'Careers'),
        ('talent', 'Talent network'),
        ('media', 'Media & press'),
    ]

    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    topic = models.CharField(max_length=30, choices=TOPIC_CHOICES, default='general')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} — {self.get_topic_display()}'


class GlobalPresence(models.Model):
    region = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'region']

    def __str__(self):
        return self.region
