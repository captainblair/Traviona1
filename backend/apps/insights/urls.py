from django.urls import path
from .views import (
    InsightDetailView,
    InsightDraftListCreateView,
    InsightEditorialDetailView,
    InsightListView,
    InsightPublishView,
    InsightUnpublishView,
)

urlpatterns = [
    path('', InsightListView.as_view(), name='insight-list'),
    path('drafts/', InsightDraftListCreateView.as_view(), name='insight-drafts'),
    path('editor/<slug:slug>/', InsightEditorialDetailView.as_view(), name='insight-editorial-detail'),
    path('<slug:slug>/publish/', InsightPublishView.as_view(), name='insight-publish'),
    path('<slug:slug>/unpublish/', InsightUnpublishView.as_view(), name='insight-unpublish'),
    path('<slug:slug>/', InsightDetailView.as_view(), name='insight-detail'),
]
