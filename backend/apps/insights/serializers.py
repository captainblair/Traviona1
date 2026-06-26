from rest_framework import serializers
from .models import Insight


class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ['id', 'title', 'slug', 'summary', 'content', 'featured_image', 'category', 'author_name', 'tags', 'read_time_minutes', 'is_published', 'published_at']
