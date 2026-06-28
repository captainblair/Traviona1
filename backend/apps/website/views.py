from django.http import Http404, StreamingHttpResponse
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .assistant import assistant_is_configured, stream_assistant_reply
from .models import AboutPage, ContactEnquiry, ContactInformation, GlobalPresence, HomePage, LeadershipMember, Service
from .serializers import (
    AboutPageSerializer,
    ContactEnquirySerializer,
    ContactInformationSerializer,
    GlobalPresenceSerializer,
    HomePageSerializer,
    LeadershipMemberSerializer,
    ServiceDetailSerializer,
    ServiceSerializer,
)

ASSISTANT_STARTER_QUESTIONS = [
    'What services do you offer?',
    'Tell me about latest geopolitical trends',
    'How can I join the talent network?',
    'Are there open roles at Traviona?',
]


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


class ContactEnquiryCreateView(generics.CreateAPIView):
    queryset = ContactEnquiry.objects.all()
    serializer_class = ContactEnquirySerializer
    permission_classes = [permissions.AllowAny]


class GlobalPresenceListView(generics.ListAPIView):
    queryset = GlobalPresence.objects.filter(is_active=True)
    serializer_class = GlobalPresenceSerializer
    permission_classes = [permissions.AllowAny]


class AssistantConfigView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'name': 'Traviona Assistant',
            'configured': assistant_is_configured(),
            'mode': assistant_mode(),
            'starter_questions': ASSISTANT_STARTER_QUESTIONS,
        })


class AssistantChatView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        messages = request.data.get('messages', [])
        response = StreamingHttpResponse(
            stream_assistant_reply(messages),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
