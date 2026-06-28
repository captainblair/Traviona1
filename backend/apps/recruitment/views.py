from django.contrib.auth import get_user_model
from django.db.models import Case, Count, IntegerField, Q, Value, When
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.core.permissions import IsRecruiterRole, has_role
from .models import ApplicationStatusHistory, ExternalJobSource, JobApplication, JobPosting, RecruitmentNotification, TalentProfile
from .pagination import JobPagination
from .serializers import ExternalJobSourceSerializer, JobApplicationSerializer, JobPostingSerializer, RecruitmentNotificationSerializer, TalentProfileSerializer

User = get_user_model()


def has_recruiter_access(user):
    return has_role(user, ['recruiter', 'admin'])


def prioritize_kenya_and_myjobmag(queryset):
    """List MyJobMag and Kenya-based roles before other external feeds."""
    return queryset.annotate(
        listing_priority=Case(
            When(source_name__icontains='myjobmag', then=Value(0)),
            When(location__icontains='kenya', then=Value(1)),
            default=Value(2),
            output_field=IntegerField(),
        )
    ).order_by('listing_priority', '-created_at')


class JobListView(generics.ListCreateAPIView):
    queryset = JobPosting.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = JobPostingSerializer
    pagination_class = JobPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        search_term = (params.get('search') or params.get('q') or '').strip()
        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term)
                | Q(summary__icontains=search_term)
                | Q(description__icontains=search_term)
                | Q(location__icontains=search_term)
                | Q(source_name__icontains=search_term)
            )

        location = (params.get('location') or '').strip()
        if location and location.lower() != 'all':
            queryset = queryset.filter(location__icontains=location.replace('-', ' '))

        employment_type = (params.get('employment_type') or '').strip()
        if employment_type and employment_type.lower() != 'all':
            queryset = queryset.filter(employment_type=employment_type)

        experience_level = (params.get('experience_level') or '').strip()
        if experience_level and experience_level.lower() != 'all':
            queryset = queryset.filter(experience_level__icontains=experience_level.replace('-', ' '))

        source_name = (params.get('source') or '').strip()
        if source_name and source_name.lower() != 'all':
            queryset = queryset.filter(source_name__icontains=source_name.replace('-', ' '))
        else:
            queryset = prioritize_kenya_and_myjobmag(queryset)

        return queryset

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


class ExternalJobSourceListCreateView(generics.ListCreateAPIView):
    queryset = ExternalJobSource.objects.all()
    serializer_class = ExternalJobSourceSerializer
    permission_classes = [IsRecruiterRole]


class ExternalJobSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExternalJobSource.objects.all()
    serializer_class = ExternalJobSourceSerializer
    permission_classes = [IsRecruiterRole]


class TalentProfileListView(generics.ListAPIView):
    queryset = TalentProfile.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = TalentProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        specialization = self.request.query_params.get('specialization')
        location = self.request.query_params.get('location')
        availability = self.request.query_params.get('availability')
        min_experience = self.request.query_params.get('min_experience')
        verified = self.request.query_params.get('is_verified')
        query = self.request.query_params.get('q')

        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if availability:
            queryset = queryset.filter(availability__icontains=availability)
        if min_experience:
            queryset = queryset.filter(years_experience__gte=min_experience)
        if verified is not None:
            queryset = queryset.filter(is_verified=str(verified).lower() in ['1', 'true', 'yes'])
        if query:
            queryset = queryset.filter(
                Q(full_name__icontains=query)
                | Q(headline__icontains=query)
                | Q(specialization__icontains=query)
                | Q(location__icontains=query)
                | Q(bio__icontains=query)
            )

        return queryset


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

        ApplicationStatusHistory.objects.create(
            application=application,
            previous_status='',
            new_status=application.status,
            note='Application submitted',
            changed_by=request.user,
        )
        RecruitmentNotification.objects.create(
            recipient=request.user,
            application=application,
            notification_type='application_submitted',
            title='Application submitted',
            message=f'Your application for {job.title} was submitted.',
        )

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

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        application = serializer.save()
        if application.status != previous_status:
            ApplicationStatusHistory.objects.create(
                application=application,
                previous_status=previous_status,
                new_status=application.status,
                note=application.notes,
                changed_by=self.request.user,
            )
            RecruitmentNotification.objects.create(
                recipient=application.applicant,
                application=application,
                notification_type='application_status_changed',
                title='Application status updated',
                message=f'Your application for {application.job.title} is now {application.get_status_display()}.',
            )


class RecruitmentDashboardView(APIView):
    permission_classes = [IsRecruiterRole]

    def get(self, request):
        applications_by_status = {
            item['status']: item['total']
            for item in JobApplication.objects.values('status').annotate(total=Count('id'))
        }
        recent_applications = JobApplication.objects.select_related('job', 'applicant').order_by('-applied_at')[:5]

        return Response({
            'active_jobs': JobPosting.objects.filter(is_active=True).count(),
            'total_applications': JobApplication.objects.count(),
            'applications_by_status': applications_by_status,
            'public_talent_profiles': TalentProfile.objects.filter(is_public=True).count(),
            'verified_talent_profiles': TalentProfile.objects.filter(is_verified=True).count(),
            'unread_notifications': RecruitmentNotification.objects.filter(recipient=request.user, is_read=False).count(),
            'recent_applications': JobApplicationSerializer(recent_applications, many=True).data,
        })


class RecruitmentNotificationListView(generics.ListAPIView):
    serializer_class = RecruitmentNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RecruitmentNotification.objects.filter(recipient=self.request.user)


class RecruitmentNotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruitmentNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch']

    def get_queryset(self):
        return RecruitmentNotification.objects.filter(recipient=self.request.user)
