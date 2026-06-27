from django.urls import path
from .views import (
    ExternalInsightSourceDetailView,
    ExternalInsightSourceListCreateView,
    InsightAuthorListView,
    InsightCategoryListView,
    InsightDetailView,
    InsightDraftListCreateView,
    InsightEditorialDetailView,
    InsightListView,
    InsightModerationStatusView,
    InsightPublishView,
    InsightTagListView,
    InsightUnpublishView,
)

urlpatterns = [
    path('', InsightListView.as_view(), name='insight-list'),
    path('authors/', InsightAuthorListView.as_view(), name='insight-author-list'),
    path('categories/', InsightCategoryListView.as_view(), name='insight-category-list'),
    path('drafts/', InsightDraftListCreateView.as_view(), name='insight-drafts'),
    path('sources/', ExternalInsightSourceListCreateView.as_view(), name='insight-source-list'),
    path('sources/<int:pk>/', ExternalInsightSourceDetailView.as_view(), name='insight-source-detail'),
    path('tags/', InsightTagListView.as_view(), name='insight-tag-list'),
    path('editor/<slug:slug>/', InsightEditorialDetailView.as_view(), name='insight-editorial-detail'),
    path('editor/<slug:slug>/moderation/', InsightModerationStatusView.as_view(), name='insight-moderation-status'),
    path('<slug:slug>/publish/', InsightPublishView.as_view(), name='insight-publish'),
    path('<slug:slug>/unpublish/', InsightUnpublishView.as_view(), name='insight-unpublish'),
    path('<slug:slug>/', InsightDetailView.as_view(), name='insight-detail'),
]
