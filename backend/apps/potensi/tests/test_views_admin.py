"""
Tests for backend/apps/potensi/admin_views.py (Unit 9).

Tests cover:
  - Unauthenticated requests to any admin endpoint return 401
  - Authenticated operator can GET list and detail
  - Authenticated operator can POST a new entry and get 201
  - Authenticated operator can PATCH an existing entry
  - Authenticated operator can DELETE an entry and get 204
  - POST with invalid foto type returns 422
  - POST with foto > 5MB returns 422
  - GET /api/admin/statistik/ returns correct counts
  - Unauthenticated request to /api/admin/statistik/ returns 401
"""

from __future__ import annotations

import io
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from apps.potensi.models import PotensiPertanian

AdminUser = get_user_model()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def operator_user(db) -> AdminUser:
    """Create an active operator user for tests."""
    return AdminUser.objects.create_user(
        username="operator_test",
        email="operator@rambipuji.desa.id",
        password="TestPass1234!",
        role="operator",
    )


@pytest.fixture
def auth_client(api_client, operator_user) -> APIClient:
    """Return an APIClient authenticated as an operator user."""
    api_client.force_authenticate(user=operator_user)
    return api_client


@pytest.fixture
def sample_pertanian(db) -> PotensiPertanian:
    """Create a sample PotensiPertanian object."""
    return PotensiPertanian.objects.create(
        nama="Lahan Sawah Contoh",
        komoditas="Padi",
        luas_ha=Decimal("5.50"),
        nama_pemilik="Pak Tani",
        kontak="0812345678",
        hasil_panen="10 ton",
        musim_tanam="Musim Hujan",
        geom=Point(112.5, -8.2, srid=4326),
    )


# ---------------------------------------------------------------------------
# Unauthenticated requests return 401
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUnauthenticatedAccess:
    def test_unauthenticated_list_returns_401(self, api_client):
        res = api_client.get("/api/admin/potensi/pertanian/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_detail_returns_401(self, api_client, sample_pertanian):
        res = api_client.get(f"/api/admin/potensi/pertanian/{sample_pertanian.id}/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_post_returns_401(self, api_client):
        res = api_client.post("/api/admin/potensi/pertanian/", {})
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_patch_returns_401(self, api_client, sample_pertanian):
        res = api_client.patch(f"/api/admin/potensi/pertanian/{sample_pertanian.id}/", {})
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_delete_returns_401(self, api_client, sample_pertanian):
        res = api_client.delete(f"/api/admin/potensi/pertanian/{sample_pertanian.id}/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_statistik_returns_401(self, api_client):
        res = api_client.get("/api/admin/statistik/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Authenticated Operator CRUD tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestOperatorCRUD:
    def test_operator_can_get_list(self, auth_client, sample_pertanian):
        res = auth_client.get("/api/admin/potensi/pertanian/")
        assert res.status_code == status.HTTP_200_OK
        assert res.data["type"] == "FeatureCollection"
        assert len(res.data["features"]) == 1
        assert res.data["features"][0]["properties"]["nama"] == "Lahan Sawah Contoh"

    def test_operator_can_get_detail(self, auth_client, sample_pertanian):
        res = auth_client.get(f"/api/admin/potensi/pertanian/{sample_pertanian.id}/")
        assert res.status_code == status.HTTP_200_OK
        assert res.data["type"] == "Feature"
        props = res.data["properties"]
        assert props["nama"] == "Lahan Sawah Contoh"
        assert props["komoditas"] == "Padi"

    def test_operator_can_post_new_entry_and_get_201(self, auth_client):
        payload = {
            "nama": "Sawah Baru",
            "komoditas": "Jagung",
            "luas_ha": "3.20",
            "nama_pemilik": "Bu Tani",
            "kontak": "0811223344",
            "hasil_panen": "6 ton",
            "musim_tanam": "Kemarau",
            "geom": '{"type": "Point", "coordinates": [112.51, -8.21]}',
        }
        res = auth_client.post("/api/admin/potensi/pertanian/", payload, format="multipart")
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data["type"] == "Feature"
        assert res.data["properties"]["nama"] == "Sawah Baru"
        assert PotensiPertanian.objects.filter(nama="Sawah Baru").exists()

    def test_operator_can_patch_existing_entry(self, auth_client, sample_pertanian):
        res = auth_client.patch(
            f"/api/admin/potensi/pertanian/{sample_pertanian.id}/",
            {"nama": "Sawah Diperbarui"},
            format="multipart",
        )
        assert res.status_code == status.HTTP_200_OK
        sample_pertanian.refresh_from_db()
        assert sample_pertanian.nama == "Sawah Diperbarui"

    def test_operator_can_delete_entry_and_get_204(self, auth_client, sample_pertanian):
        res = auth_client.delete(f"/api/admin/potensi/pertanian/{sample_pertanian.id}/")
        assert res.status_code == status.HTTP_204_NO_CONTENT
        assert not PotensiPertanian.objects.filter(id=sample_pertanian.id).exists()


# ---------------------------------------------------------------------------
# Foto Upload Validation tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestFotoValidation:
    def test_post_with_invalid_foto_type_returns_422(self, auth_client):
        bad_file = SimpleUploadedFile(
            "test.txt", b"not an image content", content_type="text/plain"
        )
        payload = {
            "nama": "Sawah Foto Salah",
            "komoditas": "Kedelai",
            "luas_ha": "1.00",
            "nama_pemilik": "Pak Andi",
            "kontak": "08122",
            "hasil_panen": "1 ton",
            "musim_tanam": "Hujan",
            "geom": '{"type": "Point", "coordinates": [112.5, -8.2]}',
            "foto": bad_file,
        }
        res = auth_client.post("/api/admin/potensi/pertanian/", payload, format="multipart")
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert res.data["status"] == "error"
        assert "foto" in res.data["errors"]

    def test_post_with_foto_exceeding_5mb_returns_422(self, auth_client):
        # Create dummy data > 5MB (5 * 1024 * 1024 + 1 bytes)
        large_content = b"\x00" * (5 * 1024 * 1024 + 1)
        large_file = SimpleUploadedFile(
            "big.jpg", large_content, content_type="image/jpeg"
        )
        payload = {
            "nama": "Sawah Foto Besar",
            "komoditas": "Kedelai",
            "luas_ha": "1.00",
            "nama_pemilik": "Pak Andi",
            "kontak": "08122",
            "hasil_panen": "1 ton",
            "musim_tanam": "Hujan",
            "geom": '{"type": "Point", "coordinates": [112.5, -8.2]}',
            "foto": large_file,
        }
        res = auth_client.post("/api/admin/potensi/pertanian/", payload, format="multipart")
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert res.data["status"] == "error"
        assert "foto" in res.data["errors"]


# ---------------------------------------------------------------------------
# Admin Statistik Endpoint tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAdminStatistik:
    def test_admin_statistik_returns_correct_counts(self, auth_client, sample_pertanian):
        res = auth_client.get("/api/admin/statistik/")
        assert res.status_code == status.HTTP_200_OK
        assert res.data["status"] == "ok"
        assert res.data["data"]["pertanian"] == 1
        assert res.data["data"]["total"] >= 1
