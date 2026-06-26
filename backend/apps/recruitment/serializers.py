from rest_framework import serializers
from .models import JobApplication, JobPosting, TalentProfile


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'slug', 'summary', 'description', 'location', 'employment_type', 'salary_range', 'experience_level', 'is_active', 'created_at']


class TalentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentProfile
        fields = ['id', 'full_name', 'headline', 'specialization', 'location', 'bio', 'years_experience', 'availability', 'is_public', 'is_verified', 'created_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applicant', 'cover_letter', 'status', 'applied_at']
