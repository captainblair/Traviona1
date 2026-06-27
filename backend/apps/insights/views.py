from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView
from apps.core.permissions import IsContentEditorRole
from .models import Insight
from .serializers import InsightEditorialSerializer, InsightSerializer


class InsightListView(generics.ListAPIView):
    queryset = Insight.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = InsightSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        query = self.request.query_params.get('q')

        if category:
            queryset = queryset.filter(category=category)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(summary__icontains=query)
                | Q(content__icontains=query)
                | Q(tags__icontains=query)
                | Q(author_name__icontains=query)
            )

        return queryset


class InsightDetailView(generics.RetrieveAPIView):
    queryset = Insight.objects.filter(is_published=True)
    serializer_class = InsightSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class InsightDraftListCreateView(generics.ListCreateAPIView):
    serializer_class = InsightEditorialSerializer
    permission_classes = [IsContentEditorRole]

    def get_queryset(self):
        queryset = Insight.objects.filter(is_published=False).order_by('-created_at')
        category = self.request.query_params.get('category')
        source_name = self.request.query_params.get('source_name')
        query = self.request.query_params.get('q')

        if category:
            queryset = queryset.filter(category=category)
        if source_name:
            queryset = queryset.filter(source_name__iexact=source_name)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(summary__icontains=query)
                | Q(content__icontains=query)
                | Q(tags__icontains=query)
                | Q(source_name__icontains=query)
            )

        return queryset


class InsightEditorialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Insight.objects.all()
    serializer_class = InsightEditorialSerializer
    permission_classes = [IsContentEditorRole]
    lookup_field = 'slug'
    schema = AutoSchema(operation_id_base='EditorialInsight')


class InsightPublishView(APIView):
    permission_classes = [IsContentEditorRole]

    def post(self, request, slug):
        insight = get_object_or_404(Insight, slug=slug)
        insight.is_published = True
        if insight.published_at is None:
            insight.published_at = timezone.now()
        insight.save(update_fields=['is_published', 'published_at'])
        return Response(InsightEditorialSerializer(insight).data)


class InsightUnpublishView(APIView):
    permission_classes = [IsContentEditorRole]

    def post(self, request, slug):
        insight = get_object_or_404(Insight, slug=slug)
        insight.is_published = False
        insight.save(update_fields=['is_published'])
        return Response(InsightEditorialSerializer(insight).data)
