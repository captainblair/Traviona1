from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'mfa_enabled', 'social_provider')
    list_filter = ('role', 'mfa_enabled', 'social_provider')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'location')
