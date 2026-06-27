from rest_framework import serializers
from .models import AboutPage, ContactInformation, GlobalPresence, HomePage, HomePageSection, LeadershipMember, Service


class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = ['id', 'title', 'summary', 'content', 'hero_image', 'seo_title', 'seo_description', 'seo_keywords', 'is_active']


class HomePageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePageSection
        fields = [
            'id',
            'section_type',
            'eyebrow',
            'title',
            'body',
            'image',
            'link_label',
            'link_url',
            'metadata',
            'display_order',
        ]


class HomePageSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()

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
            'seo_title',
            'seo_description',
            'seo_keywords',
            'sections',
            'is_active',
            'updated_at',
        ]

    def get_sections(self, obj):
        sections = obj.sections.filter(is_active=True)
        return HomePageSectionSerializer(sections, many=True, context=self.context).data


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'slug',
            'short_description',
            'description',
            'icon_name',
            'featured_image',
            'display_order',
            'is_active',
        ]


class ServiceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'slug',
            'short_description',
            'description',
            'detailed_description',
            'outcomes',
            'process',
            'icon_name',
            'featured_image',
            'seo_title',
            'seo_description',
            'seo_keywords',
            'display_order',
            'is_active',
            'created_at',
        ]


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
