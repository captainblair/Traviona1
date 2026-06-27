from rest_framework import serializers
from .models import Insight


class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'content',
            'featured_image',
            'category',
            'author_name',
            'tags',
            'read_time_minutes',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'is_published', 'published_at', 'created_at', 'updated_at']


class InsightEditorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'content',
            'featured_image',
            'category',
            'author_name',
            'tags',
            'read_time_minutes',
            'source_name',
            'source_url',
            'external_id',
            'raw_payload',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'is_published', 'published_at', 'created_at', 'updated_at']
