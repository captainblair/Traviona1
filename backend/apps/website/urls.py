from django.urls import path
from .views import (
    AboutPageView,
    ContactInformationView,
    GlobalPresenceListView,
    HomePageView,
    LeadershipMemberListView,
    ServiceListView,
)

urlpatterns = [
    path('home/', HomePageView.as_view(), name='home-page'),
    path('about/', AboutPageView.as_view(), name='about-page'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('leadership/', LeadershipMemberListView.as_view(), name='leadership-list'),
    path('contact/', ContactInformationView.as_view(), name='contact-information'),
    path('global-presence/', GlobalPresenceListView.as_view(), name='global-presence-list'),
]
