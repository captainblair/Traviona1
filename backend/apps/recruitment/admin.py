from django.contrib import admin
from .models import JobPosting, TalentProfile


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'employment_type', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'summary', 'description')


@admin.register(TalentProfile)
class TalentProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'location', 'is_public', 'created_at')
    search_fields = ('full_name', 'headline', 'specialization')
