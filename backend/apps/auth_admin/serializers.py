"""Serializers for the AdminUser account management API.

Covers list, detail, create, update, and change-own-password operations.
All password hashing uses Django's make_password / check_password utilities.
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

AdminUser = get_user_model()

_MIN_PASSWORD_LENGTH = 8


class AdminUserListSerializer(serializers.ModelSerializer):
    """Minimal serializer for list responses — omits sensitive fields."""

    class Meta:
        model = AdminUser
        fields = ["id", "username", "email", "role", "is_active", "date_joined"]
        read_only_fields = fields


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Full serializer for single-account detail responses."""

    class Meta:
        model = AdminUser
        fields = ["id", "username", "email", "role", "is_active", "date_joined", "last_login"]
        read_only_fields = fields


class AdminUserCreateSerializer(serializers.Serializer):
    """Serializer for creating a new admin account (POST /api/admin/akun/).

    Validates that:
    - username is unique across AdminUser records
    - password meets minimum length
    - password and confirm_password match

    On save, the raw password is hashed with make_password before persisting.
    """

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(choices=AdminUser.ROLE_CHOICES)
    password = serializers.CharField(write_only=True, min_length=_MIN_PASSWORD_LENGTH)
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value: str) -> str:
        if AdminUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username sudah digunakan.")
        return value

    def validate_password(self, value: str) -> str:
        if len(value) < _MIN_PASSWORD_LENGTH:
            raise serializers.ValidationError(
                f"Password minimal {_MIN_PASSWORD_LENGTH} karakter."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError(
                {"confirm_password": "Password dan konfirmasi password tidak cocok."}
            )
        return attrs

    def create(self, validated_data: dict) -> AdminUser:
        validated_data.pop("confirm_password")
        raw_password: str = validated_data.pop("password")
        validated_data["password"] = make_password(raw_password)
        return AdminUser.objects.create(**validated_data)


class AdminUserUpdateSerializer(serializers.Serializer):
    """Serializer for updating an existing admin account (PUT/PATCH).

    All fields except new_password / confirm_new_password are required.
    If new_password is provided, confirm_new_password must match and the
    password must be at least _MIN_PASSWORD_LENGTH characters.
    """

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(choices=AdminUser.ROLE_CHOICES)
    is_active = serializers.BooleanField()
    new_password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, default=""
    )
    confirm_new_password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, default=""
    )

    def validate_username(self, value: str) -> str:
        # Allow the current user to keep their own username
        instance: AdminUser | None = self.instance
        qs = AdminUser.objects.filter(username=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Username sudah digunakan.")
        return value

    def validate(self, attrs: dict) -> dict:
        new_password: str = attrs.get("new_password", "")
        confirm_new_password: str = attrs.get("confirm_new_password", "")

        if new_password:
            if len(new_password) < _MIN_PASSWORD_LENGTH:
                raise serializers.ValidationError(
                    {"new_password": f"Password minimal {_MIN_PASSWORD_LENGTH} karakter."}
                )
            if new_password != confirm_new_password:
                raise serializers.ValidationError(
                    {"confirm_new_password": "Password baru dan konfirmasi tidak cocok."}
                )
        return attrs

    def update(self, instance: AdminUser, validated_data: dict) -> AdminUser:
        new_password: str = validated_data.pop("new_password", "")
        validated_data.pop("confirm_new_password", "")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_password:
            instance.password = make_password(new_password)

        instance.save()
        return instance


class AdminChangeOwnPasswordSerializer(serializers.Serializer):
    """Serializer for changing the authenticated user's own password.

    Validates that:
    - current_password matches the stored hash
    - new_password differs from current_password
    - new_password meets minimum length
    - confirm_new_password matches new_password

    The view must pass the user via context: ``serializer = ...(context={"user": request.user})``.
    """

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=_MIN_PASSWORD_LENGTH)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value: str) -> str:
        user: AdminUser = self.context["user"]
        if not check_password(value, user.password):
            raise serializers.ValidationError("Password saat ini salah.")
        return value

    def validate(self, attrs: dict) -> dict:
        current_password: str = attrs.get("current_password", "")
        new_password: str = attrs.get("new_password", "")
        confirm_new_password: str = attrs.get("confirm_new_password", "")

        if len(new_password) < _MIN_PASSWORD_LENGTH:
            raise serializers.ValidationError(
                {"new_password": f"Password minimal {_MIN_PASSWORD_LENGTH} karakter."}
            )

        if new_password == current_password:
            raise serializers.ValidationError(
                {"new_password": "Password baru tidak boleh sama dengan password saat ini."}
            )

        if new_password != confirm_new_password:
            raise serializers.ValidationError(
                {"confirm_new_password": "Password baru dan konfirmasi tidak cocok."}
            )

        return attrs

    def save(self, **kwargs) -> AdminUser:
        user: AdminUser = self.context["user"]
        user.password = make_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
