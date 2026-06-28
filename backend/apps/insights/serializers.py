from rest_framework import serializers
from .models import ExternalInsightSource, Insight, InsightAuthor, InsightCategory, InsightTag


class InsightCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InsightCategory
        fields = ['id', 'name', 'slug', 'description', 'is_active']
        read_only_fields = ['id', 'slug']


class InsightTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsightTag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']


class InsightAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsightAuthor
        fields = ['id', 'name', 'title', 'bio', 'photo', 'is_active']


class ExternalInsightSourceSerializer(serializers.ModelSerializer):
    default_tags = serializers.PrimaryKeyRelatedField(queryset=InsightTag.objects.all(), many=True, required=False)

    class Meta:
        model = ExternalInsightSource
        fields = ['id', 'name', 'provider', 'endpoint_url', 'api_key_env', 'default_category', 'default_tags', 'is_active', 'last_synced_at', 'created_at']
        read_only_fields = ['id', 'last_synced_at', 'created_at']


class InsightSerializer(serializers.ModelSerializer):
    category_detail = InsightCategorySerializer(source='category_ref', read_only=True)
    author_detail = InsightAuthorSerializer(source='author', read_only=True)
    tag_details = InsightTagSerializer(source='tag_refs', many=True, read_only=True)

    class Meta:
        model = Insight
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'content',
            'featured_image',
            'featured_image_url',
            'category',
            'category_detail',
            'author_name',
            'author_detail',
            'tags',
            'tag_details',
            'read_time_minutes',
            'source_name',
            'source_url',
            'moderation_status',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'is_published', 'published_at', 'created_at', 'updated_at']


class InsightEditorialSerializer(serializers.ModelSerializer):
    tag_refs = serializers.PrimaryKeyRelatedField(queryset=InsightTag.objects.all(), many=True, required=False)
    category_detail = InsightCategorySerializer(source='category_ref', read_only=True)
    author_detail = InsightAuthorSerializer(source='author', read_only=True)
    tag_details = InsightTagSerializer(source='tag_refs', many=True, read_only=True)

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
            'category_ref',
            'category_detail',
            'author',
            'author_name',
            'author_detail',
            'tags',
            'tag_refs',
            'tag_details',
            'read_time_minutes',
            'source_name',
            'source_url',
            'external_id',
            'raw_payload',
            'moderation_status',
            'moderation_notes',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'is_published', 'published_at', 'created_at', 'updated_at']
