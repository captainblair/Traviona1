from rest_framework import serializers
from .models import JobApplication, JobPosting, TalentProfile


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'slug', 'summary', 'description', 'location', 'employment_type', 'salary_range', 'experience_level', 'is_active', 'created_at']


class TalentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentProfile
        fields = ['id', 'user', 'full_name', 'headline', 'specialization', 'location', 'bio', 'years_experience', 'availability', 'is_public', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'is_verified', 'created_at', 'updated_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant', 'cover_letter', 'notes', 'status', 'applied_at', 'updated_at']
        read_only_fields = ['id', 'job', 'applicant', 'cover_letter', 'applied_at', 'updated_at']
