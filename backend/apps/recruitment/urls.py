from django.urls import path
from .views import ApplyToJobView, JobDetailView, JobListView, TalentProfileListView

urlpatterns = [
    path('jobs/', JobListView.as_view(), name='job-list'),
    path('jobs/<slug:slug>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', ApplyToJobView.as_view(), name='apply-to-job'),
    path('talents/', TalentProfileListView.as_view(), name='talent-list'),
]
