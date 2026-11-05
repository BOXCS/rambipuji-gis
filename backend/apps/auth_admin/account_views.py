"""Account management views for the Rambipuji WebGIS admin panel.

Endpoints (all under /api/admin/akun/):
  GET    /           — List all admin accounts      (superadmin only)
  POST   /           — Create a new admin account   (superadmin only)
  GET    /{id}/      — Retrieve a single account    (superadmin only)
  PUT    /{id}/      — Update a single account      (superadmin only)
  DELETE /{id}/      — Delete a single account      (superadmin only)
  PUT    /me/password/ — Change own password        (any authenticated user)

Response shapes follow the project API standard:
  { "status": "ok"|"error", "data": ..., "message": ... }
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import JWTAuthentication
from .serializers import (
    AdminChangeOwnPasswordSerializer,
    AdminUserCreateSerializer,
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
)

AdminUser = get_user_model()


# ---------------------------------------------------------------------------
# Permission helpers
# ---------------------------------------------------------------------------


class IsSuperAdmin(BasePermission):
    """Allow access only to users whose role is 'superadmin'."""

    message = "Hanya superadmin yang dapat mengakses fitur ini."

    def has_permission(self, request: Request, view) -> bool:  # type: ignore[override]
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == AdminUser.ROLE_SUPERADMIN
        )


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def _get_user_or_404(pk: int) -> AdminUser | Response:
    """Return the AdminUser with *pk*, or a 404 Response dict sentinel."""
    try:
        return AdminUser.objects.get(pk=pk)
    except AdminUser.DoesNotExist:
        return None  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------


class AdminUserListCreateView(APIView):
    """GET / POST /api/admin/akun/

    GET  — Return a list of all AdminUser accounts.
    POST — Create a new AdminUser account.

    Both actions are restricted to superadmin users.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request: Request) -> Response:
        """Return all admin accounts ordered by date_joined descending."""
        users = AdminUser.objects.all().order_by("-date_joined")
        serializer = AdminUserListSerializer(users, many=True)
        return Response(
            {"status": "ok", "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request) -> Response:
        """Create a new admin account."""
        serializer = AdminUserCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Data tidak valid.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user: AdminUser = serializer.save()
        detail = AdminUserDetailSerializer(user)
        return Response(
            {
                "status": "ok",
                "data": detail.data,
                "message": "Akun berhasil dibuat.",
            },
            status=status.HTTP_201_CREATED,
        )


class AdminUserDetailView(APIView):
    """GET / PUT / DELETE /api/admin/akun/{id}/

    All actions are restricted to superadmin users.
    DELETE is additionally guarded against self-deletion.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _get_user(self, pk: int) -> AdminUser | None:
        try:
            return AdminUser.objects.get(pk=pk)
        except AdminUser.DoesNotExist:
            return None

    def _not_found_response(self) -> Response:
        return Response(
            {"status": "error", "message": "Akun tidak ditemukan."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # ------------------------------------------------------------------
    # HTTP methods
    # ------------------------------------------------------------------

    def get(self, request: Request, pk: int) -> Response:
        """Return detailed information for a single account."""
        user = self._get_user(pk)
        if user is None:
            return self._not_found_response()

        serializer = AdminUserDetailSerializer(user)
        return Response(
            {"status": "ok", "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    def put(self, request: Request, pk: int) -> Response:
        """Update an existing account (full replacement, password optional)."""
        user = self._get_user(pk)
        if user is None:
            return self._not_found_response()

        serializer = AdminUserUpdateSerializer(instance=user, data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Data tidak valid.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_user: AdminUser = serializer.save()
        detail = AdminUserDetailSerializer(updated_user)
        return Response(
            {
                "status": "ok",
                "data": detail.data,
                "message": "Akun berhasil diperbarui.",
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, pk: int) -> Response:
        """Delete an account — superadmin cannot delete their own account."""
        if request.user.pk == pk:
            return Response(
                {
                    "status": "error",
                    "message": "Tidak dapat menghapus akun sendiri.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = self._get_user(pk)
        if user is None:
            return self._not_found_response()

        user.delete()
        return Response(
            {"status": "ok", "message": "Akun berhasil dihapus."},
            status=status.HTTP_200_OK,
        )


class ChangeOwnPasswordView(APIView):
    """PUT /api/admin/akun/me/password/

    Allows any authenticated user (superadmin or operator) to change their
    own password by supplying the current password for verification.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request: Request) -> Response:
        serializer = AdminChangeOwnPasswordSerializer(
            data=request.data,
            context={"user": request.user},
        )
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Data tidak valid.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        return Response(
            {"status": "ok", "message": "Password berhasil diubah."},
            status=status.HTTP_200_OK,
        )
