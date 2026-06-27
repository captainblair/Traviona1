from django.contrib import admin
from .models import ApplicationStatusHistory, ExternalJobSource, JobApplication, JobPosting, RecruitmentNotification, TalentProfile


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'employment_type', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'summary', 'description')


@admin.register(ExternalJobSource)
class ExternalJobSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'is_active', 'last_synced_at', 'created_at')
    list_filter = ('provider', 'is_active')
    search_fields = ('name', 'endpoint_url')


@admin.register(TalentProfile)
class TalentProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'location', 'is_public', 'created_at')
    search_fields = ('full_name', 'headline', 'specialization')


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'applicant', 'status', 'applied_at', 'updated_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('job__title', 'applicant__username', 'applicant__email', 'cover_letter', 'notes')


@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('application', 'previous_status', 'new_status', 'changed_by', 'created_at')
    list_filter = ('new_status', 'created_at')
    search_fields = ('application__job__title', 'application__applicant__username', 'note')


@admin.register(RecruitmentNotification)
class RecruitmentNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'recipient', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'recipient__username')
