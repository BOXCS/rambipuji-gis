"""DRF custom authentication class for JWT Bearer token authentication.

Reads the Bearer token from the Authorization header, decodes it using
jwt_utils.decode_token(), and returns (user, token) for DRF's request.user
injection. Raises AuthenticationFailed on invalid or missing tokens.
"""

from __future__ import annotations

from typing import Optional, Tuple

from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request

from .jwt_utils import decode_token

AdminUser = get_user_model()


class JWTAuthentication(BaseAuthentication):
    """Authenticate requests using a JWT Bearer token in the Authorization header.

    DRF calls authenticate() on every request. If the Authorization header is
    absent or not a Bearer token, return None (unauthenticated, not an error)
    so other authentication classes can run. If the header is present but
    invalid, raise AuthenticationFailed.
    """

    def authenticate(self, request: Request) -> Optional[Tuple]:
        auth_header: str = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None  # Let DRF fall through to anonymous access

        raw_token: str = auth_header.split(" ", 1)[1].strip()
        if not raw_token:
            raise AuthenticationFailed("Token tidak ditemukan dalam header Authorization.")

        payload = decode_token(raw_token)  # Raises AuthenticationFailed on error

        if payload.get("token_type") != "access":
            raise AuthenticationFailed(
                "Tipe token tidak valid. Gunakan access token untuk autentikasi."
            )

        user_id: Optional[int] = payload.get("user_id")
        if not user_id:
            raise AuthenticationFailed("Payload token tidak valid: user_id tidak ditemukan.")

        try:
            user = AdminUser.objects.get(pk=user_id, is_active=True)
        except AdminUser.DoesNotExist:
            raise AuthenticationFailed("Pengguna tidak ditemukan atau sudah dinonaktifkan.")

        return (user, raw_token)

    def authenticate_header(self, request: Request) -> str:
        """Return the WWW-Authenticate header value for 401 responses."""
        return "Bearer"
