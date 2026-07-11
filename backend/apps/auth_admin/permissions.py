"""
Custom permission classes for the auth_admin application.
"""

from __future__ import annotations

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class IsAdminRole(BasePermission):
    """Permission check verifying that the user has an admin role.

    Returns True if user is authenticated and request.user.role is either
    'superadmin' or 'operator'.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not bool(request.user and request.user.is_authenticated):
            return False
        return getattr(request.user, "role", None) in ("superadmin", "operator")
