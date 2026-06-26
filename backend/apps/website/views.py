from rest_framework import generics
from .models import AboutPage, Service
from .serializers import AboutPageSerializer, ServiceSerializer


class AboutPageView(generics.RetrieveAPIView):
    queryset = AboutPage.objects.filter(is_active=True)
    serializer_class = AboutPageSerializer


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
