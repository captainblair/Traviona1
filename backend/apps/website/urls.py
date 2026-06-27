from django.urls import path
from .views import (
    AboutPageView,
    ContactEnquiryCreateView,
    ContactInformationView,
    GlobalPresenceListView,
    HomePageView,
    LeadershipMemberListView,
    ServiceDetailView,
    ServiceListView,
)

urlpatterns = [
    path('home/', HomePageView.as_view(), name='home-page'),
    path('about/', AboutPageView.as_view(), name='about-page'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('services/<slug:slug>/', ServiceDetailView.as_view(), name='service-detail'),
    path('leadership/', LeadershipMemberListView.as_view(), name='leadership-list'),
    path('contact/', ContactInformationView.as_view(), name='contact-information'),
    path('contact/enquiries/', ContactEnquiryCreateView.as_view(), name='contact-enquiry-create'),
    path('global-presence/', GlobalPresenceListView.as_view(), name='global-presence-list'),
]
