from django.contrib import admin
from .models import ExternalInsightSource, Insight, InsightAuthor, InsightCategory, InsightTag


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'category_ref', 'moderation_status', 'is_published', 'published_at', 'created_at')
    list_filter = ('moderation_status', 'is_published', 'category', 'category_ref')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'summary', 'content')
    filter_horizontal = ('tag_refs',)


@admin.register(InsightCategory)
class InsightCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')


@admin.register(InsightTag)
class InsightTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(InsightAuthor)
class InsightAuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'title', 'bio')


@admin.register(ExternalInsightSource)
class ExternalInsightSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'is_active', 'last_synced_at')
    list_filter = ('provider', 'is_active')
    search_fields = ('name', 'endpoint_url')
    filter_horizontal = ('default_tags',)
