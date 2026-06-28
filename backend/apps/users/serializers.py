from django.contrib.auth import get_user_model
from rest_framework import serializers

from .bootstrap import apply_bootstrap_admin

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "bio", "location", "headline", "role", "mfa_enabled", "social_provider"]
        read_only_fields = ["id", "role", "mfa_enabled", "social_provider"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "phone", "bio", "location", "headline"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        apply_bootstrap_admin(user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    mfa_code = serializers.CharField(required=False, allow_blank=True, write_only=True)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)


class MfaVerifySerializer(serializers.Serializer):
    code = serializers.CharField(required=True, write_only=True)


class SocialLoginSerializer(serializers.Serializer):
    PROVIDERS = ['google', 'linkedin']

    provider = serializers.ChoiceField(choices=PROVIDERS)
    access_token = serializers.CharField(required=True, write_only=True)
