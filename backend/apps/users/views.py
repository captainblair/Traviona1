from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .security import build_otpauth_uri, fetch_social_profile, generate_mfa_secret, verify_totp
from .serializers import (
    LoginSerializer,
    MfaVerifySerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    SocialLoginSerializer,
    UserSerializer,
)

User = get_user_model()


def token_response(user, status_code=status.HTTP_200_OK):
    refresh = RefreshToken.for_user(user)
    return Response({
        "user": UserSerializer(user).data,
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }, status=status_code)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return token_response(user, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data["username"],
                password=serializer.validated_data["password"],
            )
            if user is not None:
                if user.mfa_enabled and not verify_totp(user.mfa_secret, serializer.validated_data.get('mfa_code', '')):
                    return Response({"detail": "Valid MFA code required"}, status=status.HTTP_401_UNAUTHORIZED)
                return token_response(user)
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(serializer.validated_data['current_password']):
            return Response({'detail': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(serializer.validated_data['new_password'], request.user)
        except ValidationError as exc:
            return Response({'new_password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully'})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.filter(email__iexact=serializer.validated_data['email']).first()
            if user:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"
                send_mail(
                    'Reset your Traviona password',
                    f'Use this link to reset your password: {reset_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
            return Response({'detail': 'If that email exists, a reset link has been sent'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, serializer.validated_data['token']):
            return Response({'detail': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(serializer.validated_data['new_password'], user)
        except ValidationError as exc:
            return Response({'new_password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password reset successfully'})


class MfaSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.mfa_secret:
            request.user.mfa_secret = generate_mfa_secret()
            request.user.save(update_fields=['mfa_secret'])
        return Response({
            'secret': request.user.mfa_secret,
            'otpauth_uri': build_otpauth_uri(request.user, request.user.mfa_secret),
        })


class MfaEnableView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MfaVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.mfa_secret or not verify_totp(request.user.mfa_secret, serializer.validated_data['code']):
            return Response({'detail': 'Invalid MFA code'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.mfa_enabled = True
        request.user.save(update_fields=['mfa_enabled'])
        return Response({'detail': 'MFA enabled'})


class MfaDisableView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MfaVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not verify_totp(request.user.mfa_secret, serializer.validated_data['code']):
            return Response({'detail': 'Invalid MFA code'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.mfa_enabled = False
        request.user.mfa_secret = ''
        request.user.save(update_fields=['mfa_enabled', 'mfa_secret'])
        return Response({'detail': 'MFA disabled'})


class SocialLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SocialLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = fetch_social_profile(serializer.validated_data['provider'], serializer.validated_data['access_token'])
        except Exception:
            return Response({'detail': 'Social provider verification failed'}, status=status.HTTP_400_BAD_REQUEST)

        email = profile.get('email')
        uid = profile.get('uid')
        if not email or not uid:
            return Response({'detail': 'Social provider did not return a verified profile'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(social_provider=serializer.validated_data['provider'], social_uid=uid).first()
        if user is None:
            user = User.objects.filter(email__iexact=email).first()
        if user is None:
            username = email.split('@')[0]
            base_username = username
            suffix = 1
            while User.objects.filter(username=username).exists():
                suffix += 1
                username = f'{base_username}{suffix}'
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=profile.get('first_name', ''),
                last_name=profile.get('last_name', ''),
            )

        user.social_provider = serializer.validated_data['provider']
        user.social_uid = uid
        user.save(update_fields=['social_provider', 'social_uid'])
        return token_response(user)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class UpdateUserRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff and request.user.role != 'admin':
            return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        role = request.data.get('role')
        if role not in dict(User.ROLE_CHOICES):
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        user.role = role
        user.save(update_fields=['role'])
        return Response(UserSerializer(user).data)
