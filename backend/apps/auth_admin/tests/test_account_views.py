"""pytest tests for the admin account management API.

Covers every endpoint in account_views.py using pytest-django fixtures.
All tests are marked with @pytest.mark.django_db so each runs inside a
transaction that is rolled back after the test, keeping the database clean.

Endpoints under test:
  GET    /api/admin/akun/              — list
  POST   /api/admin/akun/              — create
  GET    /api/admin/akun/{id}/         — detail
  PUT    /api/admin/akun/{id}/         — update
  DELETE /api/admin/akun/{id}/         — delete
  PUT    /api/admin/akun/me/password/  — change own password
"""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework.test import APIClient

from apps.auth_admin.jwt_utils import generate_access_token

AdminUser = get_user_model()

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def api_client() -> APIClient:
    return APIClient()


def _make_user(username: str, role: str, password: str = "testpass123") -> AdminUser:
    """Create and return an AdminUser with a hashed password."""
    return AdminUser.objects.create(
        username=username,
        password=make_password(password),
        role=role,
        is_active=True,
    )


def _auth_client(user: AdminUser) -> APIClient:
    """Return an APIClient authenticated as *user* via JWT Bearer token."""
    client = APIClient()
    token = generate_access_token(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture()
def superadmin(db) -> AdminUser:
    return _make_user("superadmin_user", AdminUser.ROLE_SUPERADMIN)


@pytest.fixture()
def operator(db) -> AdminUser:
    return _make_user("operator_user", AdminUser.ROLE_OPERATOR)


@pytest.fixture()
def superadmin_client(superadmin: AdminUser) -> APIClient:
    return _auth_client(superadmin)


@pytest.fixture()
def operator_client(operator: AdminUser) -> APIClient:
    return _auth_client(operator)


# ---------------------------------------------------------------------------
# URL helpers (using named routes from account_urls.py)
# ---------------------------------------------------------------------------

LIST_CREATE_URL = "/api/admin/akun/"
ME_PASSWORD_URL = "/api/admin/akun/me/password/"


def detail_url(pk: int) -> str:
    return f"/api/admin/akun/{pk}/"


# ---------------------------------------------------------------------------
# GET /api/admin/akun/  — list
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_list_accounts_as_superadmin(superadmin_client, superadmin):
    """Superadmin should receive a 200 with a list of accounts."""
    response = superadmin_client.get(LIST_CREATE_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


@pytest.mark.django_db
def test_list_accounts_as_operator_returns_403(operator_client):
    """Operator must be denied access to the list endpoint."""
    response = operator_client.get(LIST_CREATE_URL)
    assert response.status_code == 403


# ---------------------------------------------------------------------------
# POST /api/admin/akun/  — create
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_create_account_valid(superadmin_client):
    """Creating an account with valid data should return 201."""
    payload = {
        "username": "new_operator",
        "email": "new@example.com",
        "role": "operator",
        "password": "securepass1",
        "confirm_password": "securepass1",
    }
    response = superadmin_client.post(LIST_CREATE_URL, payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "ok"
    assert data["data"]["username"] == "new_operator"
    assert data["message"] == "Akun berhasil dibuat."


@pytest.mark.django_db
def test_create_account_duplicate_username(superadmin_client, operator):
    """Creating an account with an already-used username should return 400."""
    payload = {
        "username": operator.username,
        "role": "operator",
        "password": "securepass1",
        "confirm_password": "securepass1",
    }
    response = superadmin_client.post(LIST_CREATE_URL, payload, format="json")
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"


@pytest.mark.django_db
def test_create_account_password_mismatch(superadmin_client):
    """Password and confirm_password mismatch should return 400."""
    payload = {
        "username": "another_user",
        "role": "operator",
        "password": "securepass1",
        "confirm_password": "differentpass",
    }
    response = superadmin_client.post(LIST_CREATE_URL, payload, format="json")
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"


# ---------------------------------------------------------------------------
# GET /api/admin/akun/{id}/  — detail
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_get_account_detail(superadmin_client, operator):
    """Superadmin should receive full account detail for a valid id."""
    response = superadmin_client.get(detail_url(operator.pk))
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["data"]["id"] == operator.pk
    assert data["data"]["username"] == operator.username


@pytest.mark.django_db
def test_get_account_detail_not_found(superadmin_client):
    """Non-existent id should return 404."""
    response = superadmin_client.get(detail_url(99999))
    assert response.status_code == 404
    assert response.json()["status"] == "error"


# ---------------------------------------------------------------------------
# PUT /api/admin/akun/{id}/  — update
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_update_account(superadmin_client, operator):
    """Updating an account with valid data should return 200."""
    payload = {
        "username": operator.username,
        "email": "updated@example.com",
        "role": "operator",
        "is_active": True,
    }
    response = superadmin_client.put(detail_url(operator.pk), payload, format="json")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "Akun berhasil diperbarui."
    assert data["data"]["email"] == "updated@example.com"


@pytest.mark.django_db
def test_update_account_with_new_password(superadmin_client, operator):
    """Updating with a new_password field should succeed and re-hash the password."""
    payload = {
        "username": operator.username,
        "email": operator.email,
        "role": "operator",
        "is_active": True,
        "new_password": "newpassword99",
        "confirm_new_password": "newpassword99",
    }
    response = superadmin_client.put(detail_url(operator.pk), payload, format="json")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# DELETE /api/admin/akun/{id}/  — delete
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_delete_account(superadmin_client, operator):
    """Superadmin should be able to delete a different account."""
    response = superadmin_client.delete(detail_url(operator.pk))
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "Akun berhasil dihapus."
    assert not AdminUser.objects.filter(pk=operator.pk).exists()


@pytest.mark.django_db
def test_cannot_delete_own_account(superadmin_client, superadmin):
    """Superadmin must not be able to delete their own account."""
    response = superadmin_client.delete(detail_url(superadmin.pk))
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert data["message"] == "Tidak dapat menghapus akun sendiri."


# ---------------------------------------------------------------------------
# PUT /api/admin/akun/me/password/  — change own password
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_change_own_password_success(superadmin):
    """Authenticated user should be able to change their own password."""
    client = _auth_client(superadmin)
    payload = {
        "current_password": "testpass123",
        "new_password": "newpassword99",
        "confirm_new_password": "newpassword99",
    }
    response = client.put(ME_PASSWORD_URL, payload, format="json")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "Password berhasil diubah."


@pytest.mark.django_db
def test_change_own_password_wrong_current(superadmin):
    """Supplying the wrong current password should return 400."""
    client = _auth_client(superadmin)
    payload = {
        "current_password": "wrongpassword",
        "new_password": "newpassword99",
        "confirm_new_password": "newpassword99",
    }
    response = client.put(ME_PASSWORD_URL, payload, format="json")
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"


@pytest.mark.django_db
def test_change_own_password_mismatch(superadmin):
    """Mismatched new_password / confirm should return 400."""
    client = _auth_client(superadmin)
    payload = {
        "current_password": "testpass123",
        "new_password": "newpassword99",
        "confirm_new_password": "differentpass",
    }
    response = client.put(ME_PASSWORD_URL, payload, format="json")
    assert response.status_code == 400
    assert response.json()["status"] == "error"


@pytest.mark.django_db
def test_change_own_password_same_as_current(superadmin):
    """new_password identical to current_password should return 400."""
    client = _auth_client(superadmin)
    payload = {
        "current_password": "testpass123",
        "new_password": "testpass123",
        "confirm_new_password": "testpass123",
    }
    response = client.put(ME_PASSWORD_URL, payload, format="json")
    assert response.status_code == 400
    assert response.json()["status"] == "error"
