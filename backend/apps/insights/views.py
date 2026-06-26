from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Insight
from .serializers import InsightSerializer


class InsightListView(generics.ListAPIView):
    queryset = Insight.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = InsightSerializer


class InsightDetailView(generics.RetrieveAPIView):
    queryset = Insight.objects.filter(is_published=True)
    serializer_class = InsightSerializer
    lookup_field = 'slug'


class InsightDraftsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        drafts = Insight.objects.filter(is_published=False).order_by('-created_at')
        serializer = InsightSerializer(drafts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InsightSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
