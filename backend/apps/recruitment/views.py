from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.core.permissions import IsRecruiterRole, has_role
from .models import JobApplication, JobPosting, TalentProfile
from .serializers import JobApplicationSerializer, JobPostingSerializer, TalentProfileSerializer

User = get_user_model()


def has_recruiter_access(user):
    return has_role(user, ['recruiter', 'admin'])


class JobListView(generics.ListCreateAPIView):
    queryset = JobPosting.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = JobPostingSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or not has_recruiter_access(user):
            self.permission_denied(self.request, message='Recruiter access required')
        serializer.save()


class JobDetailView(generics.RetrieveAPIView):
    queryset = JobPosting.objects.filter(is_active=True)
    serializer_class = JobPostingSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class TalentProfileListView(generics.ListAPIView):
    queryset = TalentProfile.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = TalentProfileSerializer
    permission_classes = [permissions.AllowAny]


class MyTalentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_profile(self, user):
        return get_object_or_404(TalentProfile, user=user)

    def get(self, request):
        serializer = TalentProfileSerializer(self.get_profile(request.user))
        return Response(serializer.data)

    def post(self, request):
        if TalentProfile.objects.filter(user=request.user).exists():
            return Response({'detail': 'Talent profile already exists'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TalentProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            if request.user.role == 'public':
                request.user.role = 'talent'
                request.user.save(update_fields=['role'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = TalentProfileSerializer(self.get_profile(request.user), data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TalentProfileVerifyView(APIView):
    permission_classes = [IsRecruiterRole]

    def patch(self, request, pk):
        profile = get_object_or_404(TalentProfile, pk=pk)
        is_verified = request.data.get('is_verified', True)
        if isinstance(is_verified, str):
            is_verified = is_verified.lower() in ['1', 'true', 'yes']
        profile.is_verified = bool(is_verified)
        profile.save(update_fields=['is_verified'])
        return Response(TalentProfileSerializer(profile).data)


class ApplyToJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        try:
            job = JobPosting.objects.get(pk=job_id)
        except JobPosting.DoesNotExist:
            return Response({'detail': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        application, created = JobApplication.objects.get_or_create(
            job=job,
            applicant=request.user,
            defaults={'cover_letter': request.data.get('cover_letter', '')},
        )
        if not created:
            return Response({'detail': 'You already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApplicationListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = JobApplication.objects.select_related('job', 'applicant').order_by('-applied_at')
        user = self.request.user
        if not has_recruiter_access(user):
            queryset = queryset.filter(applicant=user)

        job_id = self.request.query_params.get('job')
        status_value = self.request.query_params.get('status')
        applicant_id = self.request.query_params.get('applicant')

        if job_id:
            queryset = queryset.filter(job_id=job_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if applicant_id and has_recruiter_access(user):
            queryset = queryset.filter(applicant_id=applicant_id)

        return queryset


class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer

    def get_object(self):
        application = super().get_object()
        user = self.request.user
        if application.applicant_id != user.id and not has_recruiter_access(user):
            self.permission_denied(self.request, message='Application access required')
        return application

    def patch(self, request, *args, **kwargs):
        if not has_recruiter_access(request.user):
            return Response({'detail': 'Recruiter access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().patch(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        if not has_recruiter_access(request.user):
            return Response({'detail': 'Recruiter access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().put(request, *args, **kwargs)
