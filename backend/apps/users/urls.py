from django.urls import path
from .views import (
    LoginView,
    MeView,
    MfaDisableView,
    MfaEnableView,
    MfaSetupView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    SocialLoginView,
    UpdateUserRoleView,
    UserDetailView,
    UserListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('social-login/', SocialLoginView.as_view(), name='social-login'),
    path('me/', MeView.as_view(), name='me'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('mfa/setup/', MfaSetupView.as_view(), name='mfa-setup'),
    path('mfa/enable/', MfaEnableView.as_view(), name='mfa-enable'),
    path('mfa/disable/', MfaDisableView.as_view(), name='mfa-disable'),
    path('', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('<int:pk>/role/', UpdateUserRoleView.as_view(), name='update-role'),
]
