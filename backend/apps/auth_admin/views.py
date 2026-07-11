"""Login and logout views for the Rambipuji WebGIS admin authentication system.

LoginView  — POST /api/auth/login/
LogoutView — POST /api/auth/logout/

Response shapes follow the API standard defined in code-standards.md:
  { "status": "ok"|"error", "data": ..., "message": ... }

The password field is never returned in any response.
"""

from __future__ import annotations

from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import JWTAuthentication
from .jwt_utils import generate_access_token, generate_refresh_token

AdminUser = get_user_model()

# Name of the HttpOnly cookie that holds the refresh token.
REFRESH_TOKEN_COOKIE = "refresh_token"


class LoginView(APIView):
    """Accept email/username + password; return access token and set refresh cookie.

    POST /api/auth/login/
    Request body: { "username": "...", "password": "..." }
    Successful response: { "status": "ok", "data": { "access_token": "...",
                           "user": { "id", "username", "email", "role" } } }
    """

    authentication_classes = []  # Login endpoint is public — no auth required
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        username: str = request.data.get("username", "").strip()
        password: str = request.data.get("password", "").strip()

        if not username or not password:
            return Response(
                {
                    "status": "error",
                    "message": "Username dan password wajib diisi.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response(
                {
                    "status": "error",
                    "message": "Username atau password salah.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {
                    "status": "error",
                    "message": "Akun telah dinonaktifkan. Hubungi superadmin.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token: str = generate_access_token(user)
        refresh_token: str = generate_refresh_token(user)

        response = Response(
            {
                "status": "ok",
                "data": {
                    "access_token": access_token,
                    "user": {
                        "id": user.pk,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    },
                },
            },
            status=status.HTTP_200_OK,
        )

        # Store refresh token in an HttpOnly cookie — not accessible from JS
        response.set_cookie(
            key=REFRESH_TOKEN_COOKIE,
            value=refresh_token,
            httponly=True,
            samesite="Lax",
            secure=False,  # Set to True in production behind HTTPS
        )

        return response


class LogoutView(APIView):
    """Clear the refresh token HttpOnly cookie and confirm logout.

    POST /api/auth/logout/
    Requires a valid Bearer access token in the Authorization header.
    Response: { "status": "ok", "message": "Logout berhasil" }
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        response = Response(
            {"status": "ok", "message": "Logout berhasil"},
            status=status.HTTP_200_OK,
        )
        response.delete_cookie(REFRESH_TOKEN_COOKIE)
        return response
