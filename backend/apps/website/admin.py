from django.contrib import admin
from .models import AboutPage, ContactInformation, GlobalPresence, HomePage, LeadershipMember, Service


@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(HomePage)
class HomePageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at')


@admin.register(LeadershipMember)
class LeadershipMemberAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role_title', 'display_order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('full_name', 'role_title', 'bio')


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ('label', 'email', 'phone', 'is_active', 'updated_at')


@admin.register(GlobalPresence)
class GlobalPresenceAdmin(admin.ModelAdmin):
    list_display = ('region', 'display_order', 'is_active')
    list_filter = ('is_active',)
