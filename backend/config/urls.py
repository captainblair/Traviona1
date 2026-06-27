"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.permissions import AllowAny
from rest_framework.schemas import get_schema_view
from apps.core.views import api_index, health_check, home_view

schema_view = get_schema_view(
    title='Traviona API',
    description='Backend API schema for Traviona Consulting.',
    version='0.1.0',
    public=True,
    authentication_classes=[],
    permission_classes=[AllowAny],
)

urlpatterns = [
    path('', home_view, name='home'),
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/', api_index, name='api-index'),
    path('api/schema/', schema_view, name='api-schema'),
    path('api/users/', include('apps.users.urls')),
    path('api/website/', include('apps.website.urls')),
    path('api/insights/', include('apps.insights.urls')),
    path('api/recruitment/', include('apps.recruitment.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
