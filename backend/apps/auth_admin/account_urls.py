"""URL configuration for the admin account management API.

Mounted at /api/admin/akun/ in backend/config/urls.py.

Routes:
  GET  /api/admin/akun/              — list all accounts
  POST /api/admin/akun/              — create account
  PUT  /api/admin/akun/me/password/  — change own password  (registered FIRST)
  GET  /api/admin/akun/{id}/         — account detail
  PUT  /api/admin/akun/{id}/         — update account
  DELETE /api/admin/akun/{id}/       — delete account

The me/password/ route is registered before <int:pk>/ so Django does not
attempt to coerce the literal string "me" to an integer.
"""

from django.urls import path

from .account_views import AdminUserDetailView, AdminUserListCreateView, ChangeOwnPasswordView

urlpatterns = [
    # Static paths first — must come before <int:pk>/ pattern
    path("me/password/", ChangeOwnPasswordView.as_view(), name="admin-akun-me-password"),
    # Dynamic paths
    path("", AdminUserListCreateView.as_view(), name="admin-akun-list-create"),
    path("<int:pk>/", AdminUserDetailView.as_view(), name="admin-akun-detail"),
]
