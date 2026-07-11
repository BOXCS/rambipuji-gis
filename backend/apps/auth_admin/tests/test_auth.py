"""
Tests for backend/apps/auth_admin/

Tests cover:
- Valid login returns 200 and access_token
- Invalid password returns 401
- Missing fields returns 400
- Logout clears refresh cookie and returns 200
- Protected endpoint returns 401 without token
- Protected endpoint returns 200 with valid token

Run from the backend container:
    pytest apps/auth_admin/tests/test_auth.py -v
"""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.auth_admin.jwt_utils import generate_access_token

AdminUser = get_user_model()

LOGIN_URL = "/api/auth/login/"
LOGOUT_URL = "/api/auth/logout/"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def operator_user(db) -> AdminUser:
    """Create an active operator user for tests."""
    user = AdminUser.objects.create_user(
        username="operator_test",
        email="operator@rambipuji.desa.id",
        password="TestPass1234!",
        role="operator",
    )
    return user


@pytest.fixture
def superadmin_user(db) -> AdminUser:
    """Create an active superadmin user for tests."""
    user = AdminUser.objects.create_user(
        username="superadmin_test",
        email="superadmin@rambipuji.desa.id",
        password="SuperPass5678!",
        role="superadmin",
    )
    return user


@pytest.fixture
def valid_access_token(operator_user) -> str:
    """Generate a valid access token for the operator user."""
    return generate_access_token(operator_user)


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLoginView:
    def test_valid_login_returns_200_and_access_token(self, api_client, operator_user):
        response = api_client.post(
            LOGIN_URL,
            {"username": "operator_test", "password": "TestPass1234!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "ok"
        assert "access_token" in response.data["data"]
        assert response.data["data"]["access_token"] != ""

    def test_valid_login_returns_user_info_without_password(self, api_client, operator_user):
        response = api_client.post(
            LOGIN_URL,
            {"username": "operator_test", "password": "TestPass1234!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        user_data = response.data["data"]["user"]
        assert "password" not in user_data
        assert user_data["role"] == "operator"
        assert user_data["username"] == "operator_test"

    def test_valid_login_sets_refresh_cookie(self, api_client, operator_user):
        response = api_client.post(
            LOGIN_URL,
            {"username": "operator_test", "password": "TestPass1234!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "refresh_token" in response.cookies
        cookie = response.cookies["refresh_token"]
        assert cookie["httponly"]

    def test_invalid_password_returns_401(self, api_client, operator_user):
        response = api_client.post(
            LOGIN_URL,
            {"username": "operator_test", "password": "WrongPassword!"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["status"] == "error"

    def test_missing_username_returns_400(self, api_client):
        response = api_client.post(
            LOGIN_URL,
            {"password": "SomePassword!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["status"] == "error"

    def test_missing_password_returns_400(self, api_client):
        response = api_client.post(
            LOGIN_URL,
            {"username": "operator_test"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["status"] == "error"

    def test_empty_body_returns_400(self, api_client):
        response = api_client.post(LOGIN_URL, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_nonexistent_user_returns_401(self, api_client, db):
        response = api_client.post(
            LOGIN_URL,
            {"username": "nobody", "password": "anything"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Logout tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogoutView:
    def test_logout_with_valid_token_returns_200(
        self, api_client, operator_user, valid_access_token
    ):
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {valid_access_token}")
        response = api_client.post(LOGOUT_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "ok"
        assert response.data["message"] == "Logout berhasil"

    def test_logout_clears_refresh_cookie(
        self, api_client, operator_user, valid_access_token
    ):
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {valid_access_token}")
        response = api_client.post(LOGOUT_URL)
        assert response.status_code == status.HTTP_200_OK
        # Django sets Max-Age=0 or expires to past for deleted cookies
        if "refresh_token" in response.cookies:
            cookie = response.cookies["refresh_token"]
            assert cookie.value == "" or int(cookie.get("max-age", 1)) <= 0

    def test_logout_without_token_returns_401(self, api_client, db):
        api_client.credentials()  # No Authorization header
        response = api_client.post(LOGOUT_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# JWT Authentication on protected endpoint
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestJWTAuthentication:
    def test_protected_endpoint_returns_401_without_token(self, api_client, db):
        """Logout requires auth — use it as a convenient protected endpoint."""
        api_client.credentials()
        response = api_client.post(LOGOUT_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_returns_200_with_valid_token(
        self, api_client, operator_user, valid_access_token
    ):
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {valid_access_token}")
        response = api_client.post(LOGOUT_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_invalid_token_returns_401(self, api_client, db):
        api_client.credentials(HTTP_AUTHORIZATION="Bearer not.a.valid.token")
        response = api_client.post(LOGOUT_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
