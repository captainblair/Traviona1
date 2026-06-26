from rest_framework import serializers
from .models import AboutPage, Service


class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = ['id', 'title', 'summary', 'content', 'hero_image', 'is_active']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'slug', 'description', 'icon_name', 'is_active']
