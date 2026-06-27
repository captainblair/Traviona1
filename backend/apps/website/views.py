from django.http import Http404
from rest_framework import generics, permissions
from .models import AboutPage, ContactInformation, GlobalPresence, HomePage, LeadershipMember, Service
from .serializers import (
    AboutPageSerializer,
    ContactInformationSerializer,
    GlobalPresenceSerializer,
    HomePageSerializer,
    LeadershipMemberSerializer,
    ServiceDetailSerializer,
    ServiceSerializer,
)


class LatestActiveMixin:
    def get_object(self):
        page = self.get_queryset().order_by('-updated_at', '-id').first()
        if page is None:
            raise Http404
        return page


class HomePageView(LatestActiveMixin, generics.RetrieveAPIView):
    queryset = HomePage.objects.filter(is_active=True)
    serializer_class = HomePageSerializer
    permission_classes = [permissions.AllowAny]


class AboutPageView(LatestActiveMixin, generics.RetrieveAPIView):
    queryset = AboutPage.objects.filter(is_active=True)
    serializer_class = AboutPageSerializer
    permission_classes = [permissions.AllowAny]


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class LeadershipMemberListView(generics.ListAPIView):
    queryset = LeadershipMember.objects.filter(is_active=True)
    serializer_class = LeadershipMemberSerializer
    permission_classes = [permissions.AllowAny]


class ContactInformationView(LatestActiveMixin, generics.RetrieveAPIView):
    queryset = ContactInformation.objects.filter(is_active=True)
    serializer_class = ContactInformationSerializer
    permission_classes = [permissions.AllowAny]


class GlobalPresenceListView(generics.ListAPIView):
    queryset = GlobalPresence.objects.filter(is_active=True)
    serializer_class = GlobalPresenceSerializer
    permission_classes = [permissions.AllowAny]
