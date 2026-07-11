"""JWT utility functions for the Rambipuji WebGIS admin authentication system.

All secrets and expiry settings are read from Django settings (which sources
them from .env via config/settings.py). No values are hardcoded here.
"""

from __future__ import annotations

import datetime
from typing import Any

import jwt
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


def _get_jwt_secret() -> str:
    """Return JWT_SECRET_KEY from settings — sourced from .env."""
    secret: str = getattr(settings, "JWT_SECRET_KEY", "")
    if not secret:
        raise ValueError("JWT_SECRET_KEY must be set in .env / settings.py")
    return secret


def _get_expiry_hours() -> int:
    """Return JWT_EXPIRY_HOURS from settings — sourced from .env."""
    return int(getattr(settings, "JWT_EXPIRY_HOURS", 24))


def generate_access_token(user: Any) -> str:
    """Issue a signed JWT access token for the given user.

    Payload contains user id, username, email, role, token type, and expiry.
    Signed using HS256 with JWT_SECRET_KEY from settings.
    """
    expiry = datetime.datetime.utcnow() + datetime.timedelta(
        hours=_get_expiry_hours()
    )
    payload: dict[str, Any] = {
        "token_type": "access",
        "user_id": user.pk,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "exp": expiry,
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm="HS256")


def generate_refresh_token(user: Any) -> str:
    """Issue a signed JWT refresh token for the given user.

    Refresh tokens have a longer expiry (7× the access token expiry)
    and are stored in an HttpOnly cookie — not returned in the response body.
    """
    expiry = datetime.datetime.utcnow() + datetime.timedelta(
        hours=_get_expiry_hours() * 7
    )
    payload: dict[str, Any] = {
        "token_type": "refresh",
        "user_id": user.pk,
        "exp": expiry,
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token string.

    Returns the decoded payload dict on success.
    Raises AuthenticationFailed on expiry or invalid signature.
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token, _get_jwt_secret(), algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token telah kedaluwarsa. Silakan login kembali.")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Token tidak valid.")
