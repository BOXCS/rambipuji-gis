"""
Tests for ShapefileImportView (POST /api/admin/import/shapefile/).
"""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.imports.services.import_service import ShapefileValidationError
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile

AdminUser = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def operator_user(db):
    return AdminUser.objects.create_user(
        username="operator_import",
        email="op_imp@rambipuji.desa.id",
        password="Pass1234!",
        role="operator",
    )


@pytest.fixture
def auth_client(client, operator_user):
    client.force_authenticate(user=operator_user)
    return client


@pytest.mark.django_db
class TestShapefileImportView:
    def test_unauthenticated_request_returns_401(self, client):
        res = client.post("/api/admin/import/shapefile/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_missing_file_returns_422(self, auth_client):
        res = auth_client.post("/api/admin/import/shapefile/", {"kategori": "umkm"})
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert res.data["status"] == "error"

    def test_invalid_kategori_returns_422(self, auth_client):
        dummy_file = SimpleUploadedFile("data.zip", b"dummy")
        res = auth_client.post(
            "/api/admin/import/shapefile/",
            {"kategori": "invalid", "file": dummy_file},
            format="multipart",
        )
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch("apps.imports.views.import_shapefile")
    def test_successful_import_returns_200(self, mock_import, auth_client):
        mock_import.return_value = {
            "imported": 5,
            "kategori": "umkm",
            "filename": "data.zip",
        }
        dummy_file = SimpleUploadedFile("data.zip", b"dummy")
        res = auth_client.post(
            "/api/admin/import/shapefile/",
            {"kategori": "umkm", "file": dummy_file},
            format="multipart",
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.data["status"] == "ok"
        assert res.data["data"]["imported"] == 5

    @patch("apps.imports.views.import_shapefile")
    def test_validation_error_returns_422(self, mock_import, auth_client):
        mock_import.side_effect = ShapefileValidationError("Invalid shapefile format.")
        dummy_file = SimpleUploadedFile("data.zip", b"dummy")
        res = auth_client.post(
            "/api/admin/import/shapefile/",
            {"kategori": "umkm", "file": dummy_file},
            format="multipart",
        )
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert res.data["message"] == "Invalid shapefile format."
