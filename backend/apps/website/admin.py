from django.contrib import admin
from .models import AboutPage, ContactEnquiry, ContactInformation, GlobalPresence, HomePage, HomePageSection, LeadershipMember, Service


@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at')
    fieldsets = (
        (None, {'fields': ('title', 'summary', 'content', 'hero_image', 'is_active')}),
        ('SEO', {'fields': ('seo_title', 'seo_description', 'seo_keywords')}),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'is_active')
    list_filter = ('is_active',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'short_description', 'description', 'detailed_description')
    fieldsets = (
        (None, {'fields': ('name', 'slug', 'short_description', 'description', 'detailed_description', 'outcomes', 'process')}),
        ('Presentation', {'fields': ('icon_name', 'featured_image', 'display_order', 'is_active')}),
        ('SEO', {'fields': ('seo_title', 'seo_description', 'seo_keywords')}),
    )


class HomePageSectionInline(admin.TabularInline):
    model = HomePageSection
    extra = 1


@admin.register(HomePage)
class HomePageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at')
    inlines = [HomePageSectionInline]
    fieldsets = (
        (None, {'fields': ('title', 'subtitle', 'hero_image', 'is_active')}),
        ('Calls to action', {'fields': ('primary_call_to_action_label', 'primary_call_to_action_url', 'secondary_call_to_action_label', 'secondary_call_to_action_url')}),
        ('SEO', {'fields': ('seo_title', 'seo_description', 'seo_keywords')}),
    )


@admin.register(LeadershipMember)
class LeadershipMemberAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role_title', 'display_order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('full_name', 'role_title', 'bio')


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ('label', 'email', 'phone', 'is_active', 'updated_at')


@admin.register(ContactEnquiry)
class ContactEnquiryAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'topic', 'is_read', 'created_at')
    list_filter = ('topic', 'is_read', 'created_at')
    search_fields = ('full_name', 'email', 'company', 'message')
    readonly_fields = ('full_name', 'email', 'company', 'topic', 'message', 'created_at')


@admin.register(GlobalPresence)
class GlobalPresenceAdmin(admin.ModelAdmin):
    list_display = ('region', 'display_order', 'is_active')
    list_filter = ('is_active',)
