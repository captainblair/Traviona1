from rest_framework import serializers
from .models import ApplicationStatusHistory, JobApplication, JobPosting, RecruitmentNotification, TalentProfile


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'slug', 'summary', 'description', 'location', 'employment_type', 'salary_range', 'experience_level', 'is_active', 'created_at']


class TalentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentProfile
        fields = ['id', 'user', 'full_name', 'headline', 'specialization', 'location', 'bio', 'years_experience', 'availability', 'is_public', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'is_verified', 'created_at', 'updated_at']


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = ApplicationStatusHistory
        fields = ['id', 'previous_status', 'new_status', 'note', 'changed_by', 'changed_by_username', 'created_at']
        read_only_fields = ['id', 'changed_by', 'changed_by_username', 'created_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant', 'cover_letter', 'notes', 'status', 'status_history', 'applied_at', 'updated_at']
        read_only_fields = ['id', 'job', 'applicant', 'cover_letter', 'applied_at', 'updated_at']


class RecruitmentNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruitmentNotification
        fields = ['id', 'application', 'notification_type', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'application', 'notification_type', 'title', 'message', 'created_at']
