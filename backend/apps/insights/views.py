from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView
from apps.core.permissions import IsContentEditorRole
from .models import ExternalInsightSource, Insight, InsightAuthor, InsightCategory, InsightTag
from .serializers import (
    ExternalInsightSourceSerializer,
    InsightAuthorSerializer,
    InsightCategorySerializer,
    InsightEditorialSerializer,
    InsightSerializer,
    InsightTagSerializer,
)


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
            queryset = queryset.filter(Q(category=category) | Q(category_ref__slug=category) | Q(category_ref__name__iexact=category))
        if tag:
            queryset = queryset.filter(Q(tags__icontains=tag) | Q(tag_refs__slug=tag) | Q(tag_refs__name__iexact=tag)).distinct()
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(summary__icontains=query)
                | Q(content__icontains=query)
                | Q(tags__icontains=query)
                | Q(tag_refs__name__icontains=query)
                | Q(author_name__icontains=query)
                | Q(author__name__icontains=query)
            ).distinct()

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
        moderation_status = self.request.query_params.get('moderation_status')
        source_name = self.request.query_params.get('source_name')
        query = self.request.query_params.get('q')

        if category:
            queryset = queryset.filter(Q(category=category) | Q(category_ref__slug=category) | Q(category_ref__name__iexact=category))
        if moderation_status:
            queryset = queryset.filter(moderation_status=moderation_status)
        if source_name:
            queryset = queryset.filter(source_name__iexact=source_name)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(summary__icontains=query)
                | Q(content__icontains=query)
                | Q(tags__icontains=query)
                | Q(source_name__icontains=query)
            ).distinct()

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
        insight.moderation_status = 'published'
        if insight.published_at is None:
            insight.published_at = timezone.now()
        insight.save(update_fields=['is_published', 'moderation_status', 'published_at'])
        return Response(InsightEditorialSerializer(insight).data)


class InsightUnpublishView(APIView):
    permission_classes = [IsContentEditorRole]

    def post(self, request, slug):
        insight = get_object_or_404(Insight, slug=slug)
        insight.is_published = False
        insight.moderation_status = 'draft'
        insight.save(update_fields=['is_published', 'moderation_status'])
        return Response(InsightEditorialSerializer(insight).data)


class InsightModerationStatusView(APIView):
    permission_classes = [IsContentEditorRole]

    def patch(self, request, slug):
        insight = get_object_or_404(Insight, slug=slug)
        moderation_status = request.data.get('moderation_status')
        valid_statuses = [choice[0] for choice in Insight.MODERATION_STATUS_CHOICES]
        if moderation_status not in valid_statuses:
            return Response({'detail': 'Invalid moderation status'}, status=status.HTTP_400_BAD_REQUEST)

        insight.moderation_status = moderation_status
        insight.moderation_notes = request.data.get('moderation_notes', insight.moderation_notes)
        insight.is_published = moderation_status == 'published'
        if insight.is_published and insight.published_at is None:
            insight.published_at = timezone.now()
        insight.save(update_fields=['moderation_status', 'moderation_notes', 'is_published', 'published_at'])
        return Response(InsightEditorialSerializer(insight).data)


class InsightCategoryListView(generics.ListAPIView):
    queryset = InsightCategory.objects.filter(is_active=True)
    serializer_class = InsightCategorySerializer
    permission_classes = [permissions.AllowAny]


class InsightTagListView(generics.ListAPIView):
    queryset = InsightTag.objects.all()
    serializer_class = InsightTagSerializer
    permission_classes = [permissions.AllowAny]


class InsightAuthorListView(generics.ListAPIView):
    queryset = InsightAuthor.objects.filter(is_active=True)
    serializer_class = InsightAuthorSerializer
    permission_classes = [permissions.AllowAny]


class ExternalInsightSourceListCreateView(generics.ListCreateAPIView):
    queryset = ExternalInsightSource.objects.all()
    serializer_class = ExternalInsightSourceSerializer
    permission_classes = [IsContentEditorRole]


class ExternalInsightSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExternalInsightSource.objects.all()
    serializer_class = ExternalInsightSourceSerializer
    permission_classes = [IsContentEditorRole]
