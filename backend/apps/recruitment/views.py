from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import JobApplication, JobPosting, TalentProfile
from .serializers import JobApplicationSerializer, JobPostingSerializer, TalentProfileSerializer


class JobListView(generics.ListAPIView):
    queryset = JobPosting.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = JobPostingSerializer


class JobDetailView(generics.RetrieveAPIView):
    queryset = JobPosting.objects.filter(is_active=True)
    serializer_class = JobPostingSerializer
    lookup_field = 'slug'


class TalentProfileListView(generics.ListAPIView):
    queryset = TalentProfile.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = TalentProfileSerializer


class ApplyToJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        try:
            job = JobPosting.objects.get(pk=job_id)
        except JobPosting.DoesNotExist:
            return Response({'detail': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        application, created = JobApplication.objects.get_or_create(job=job, applicant=request.user)
        if not created:
            return Response({'detail': 'You already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
