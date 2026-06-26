from django.urls import path
from .views import InsightDetailView, InsightDraftsView, InsightListView

urlpatterns = [
    path('', InsightListView.as_view(), name='insight-list'),
    path('drafts/', InsightDraftsView.as_view(), name='insight-drafts'),
    path('<slug:slug>/', InsightDetailView.as_view(), name='insight-detail'),
]
