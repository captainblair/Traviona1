from django.urls import path
from .views import (
    ApplicationDetailView,
    ApplicationListView,
    ApplyToJobView,
    ExternalJobSourceDetailView,
    ExternalJobSourceListCreateView,
    JobDetailView,
    JobListView,
    MyTalentProfileView,
    RecruitmentDashboardView,
    RecruitmentNotificationDetailView,
    RecruitmentNotificationListView,
    TalentProfileListView,
    TalentProfileVerifyView,
)

urlpatterns = [
    path('dashboard/', RecruitmentDashboardView.as_view(), name='recruitment-dashboard'),
    path('job-sources/', ExternalJobSourceListCreateView.as_view(), name='external-job-source-list'),
    path('job-sources/<int:pk>/', ExternalJobSourceDetailView.as_view(), name='external-job-source-detail'),
    path('jobs/', JobListView.as_view(), name='job-list'),
    path('jobs/<slug:slug>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<int:job_id>/apply/', ApplyToJobView.as_view(), name='apply-to-job'),
    path('applications/', ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('notifications/', RecruitmentNotificationListView.as_view(), name='recruitment-notification-list'),
    path('notifications/<int:pk>/', RecruitmentNotificationDetailView.as_view(), name='recruitment-notification-detail'),
    path('talents/', TalentProfileListView.as_view(), name='talent-list'),
    path('talents/me/', MyTalentProfileView.as_view(), name='my-talent-profile'),
    path('talents/<int:pk>/verify/', TalentProfileVerifyView.as_view(), name='talent-verify'),
]
