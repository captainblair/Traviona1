from django.urls import path
from .views import AboutPageView, ServiceListView

urlpatterns = [
    path('about/', AboutPageView.as_view(), name='about-page'),
    path('services/', ServiceListView.as_view(), name='service-list'),
]
