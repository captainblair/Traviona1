from rest_framework import serializers
from .models import AboutPage, ContactInformation, GlobalPresence, HomePage, LeadershipMember, Service


class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = ['id', 'title', 'summary', 'content', 'hero_image', 'is_active']


class HomePageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePage
        fields = [
            'id',
            'title',
            'subtitle',
            'hero_image',
            'primary_call_to_action_label',
            'primary_call_to_action_url',
            'secondary_call_to_action_label',
            'secondary_call_to_action_url',
            'is_active',
            'updated_at',
        ]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'slug', 'description', 'icon_name', 'is_active']


class LeadershipMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadershipMember
        fields = ['id', 'full_name', 'role_title', 'bio', 'photo', 'linkedin_url', 'display_order']


class ContactInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInformation
        fields = ['id', 'label', 'email', 'phone', 'address', 'linkedin_url', 'updated_at']


class GlobalPresenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalPresence
        fields = ['id', 'region', 'summary', 'display_order']
