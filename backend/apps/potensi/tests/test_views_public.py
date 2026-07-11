"""
Tests for public API endpoints in /api/public/

All endpoints are public (AllowAny) — no authentication required.

Test cases:
  - Each per-category list returns 200 and type=FeatureCollection
  - Combined /api/public/potensi/ returns all features merged
  - ?kategori= filter returns only matching category features
  - Unknown ?kategori= returns 400
  - Detail endpoint returns 200 and type=Feature for existing object
  - Detail endpoint returns 404 for non-existent id
  - Unknown kategori on detail returns 404
  - /api/public/statistik/ returns correct keys and integer counts
  - /api/public/desa/ returns expected village profile keys

Run from the backend container:
    pytest apps/potensi/tests/test_views_public.py -v
"""

from __future__ import annotations

import pytest
from django.contrib.gis.geos import MultiPolygon, Point, Polygon
from rest_framework import status
from rest_framework.test import APIClient

from apps.potensi.models import (
    BatasWilayah,
    PotensiInfrastruktur,
    PotensiPertanian,
    PotensiUMKM,
    PotensiWisata,
)

# ---------------------------------------------------------------------------
# URL constants
# ---------------------------------------------------------------------------

URL_PERTANIAN = "/api/public/pertanian/"
URL_UMKM = "/api/public/umkm/"
URL_WISATA = "/api/public/wisata/"
URL_INFRASTRUKTUR = "/api/public/infrastruktur/"
URL_BATAS = "/api/public/batas-wilayah/"
URL_POTENSI = "/api/public/potensi/"
URL_STATISTIK = "/api/public/statistik/"
URL_DESA = "/api/public/desa/"


# ---------------------------------------------------------------------------
# Shared geometry helpers
# ---------------------------------------------------------------------------

def _make_point() -> Point:
    return Point(112.5, -8.2, srid=4326)


def _make_polygon() -> Polygon:
    return Polygon(
        ((112.0, -8.0), (112.1, -8.0), (112.1, -8.1), (112.0, -8.1), (112.0, -8.0)),
        srid=4326,
    )


def _make_multipolygon() -> MultiPolygon:
    return MultiPolygon(_make_polygon(), srid=4326)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def pertanian(db) -> PotensiPertanian:
    return PotensiPertanian.objects.create(
        nama="Sawah Test",
        komoditas="Padi",
        geom=_make_point(),
    )


@pytest.fixture
def umkm(db) -> PotensiUMKM:
    return PotensiUMKM.objects.create(
        nama_usaha="Warung Test",
        jenis_produk="Makanan",
        nama_pemilik="Pak Test",
        geom=_make_point(),
    )


@pytest.fixture
def wisata(db) -> PotensiWisata:
    return PotensiWisata.objects.create(
        nama="Wisata Test",
        geom=_make_point(),
    )


@pytest.fixture
def infrastruktur(db) -> PotensiInfrastruktur:
    return PotensiInfrastruktur.objects.create(
        nama="Balai Test",
        jenis_fasilitas="Pemerintahan",
        geom=_make_point(),
    )


@pytest.fixture
def batas(db) -> BatasWilayah:
    return BatasWilayah.objects.create(
        nama_wilayah="Desa Test",
        jenis="desa",
        geom=_make_multipolygon(),
    )


@pytest.fixture
def all_potensi(pertanian, umkm, wisata, infrastruktur):
    """Fixture that creates one instance of every potensi category."""
    return pertanian, umkm, wisata, infrastruktur


# ---------------------------------------------------------------------------
# Per-category list tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPerCategoryListViews:
    def test_pertanian_list_returns_200_and_feature_collection(self, client, pertanian):
        response = client.get(URL_PERTANIAN)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert len(response.data["features"]) == 1

    def test_umkm_list_returns_200_and_feature_collection(self, client, umkm):
        response = client.get(URL_UMKM)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert len(response.data["features"]) == 1

    def test_wisata_list_returns_200_and_feature_collection(self, client, wisata):
        response = client.get(URL_WISATA)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert len(response.data["features"]) == 1

    def test_infrastruktur_list_returns_200_and_feature_collection(self, client, infrastruktur):
        response = client.get(URL_INFRASTRUKTUR)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert len(response.data["features"]) == 1

    def test_batas_wilayah_list_returns_200_and_feature_collection(self, client, batas):
        response = client.get(URL_BATAS)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert len(response.data["features"]) == 1

    def test_empty_category_returns_empty_feature_collection(self, client, db):
        response = client.get(URL_PERTANIAN)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert response.data["features"] == []

    def test_no_auth_required_for_list(self, client, pertanian):
        """Public endpoint must not require Authorization header."""
        client.credentials()  # ensure no token
        response = client.get(URL_PERTANIAN)
        assert response.status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Combined list and ?kategori= filter tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestCombinedPotensiListView:
    def test_combined_returns_200_and_feature_collection(self, client, all_potensi):
        response = client.get(URL_POTENSI)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"

    def test_combined_contains_all_categories(self, client, all_potensi):
        response = client.get(URL_POTENSI)
        assert response.status_code == status.HTTP_200_OK
        # One instance per category → 4 total features
        assert len(response.data["features"]) == 4

    def test_kategori_filter_returns_only_pertanian(self, client, all_potensi):
        response = client.get(URL_POTENSI, {"kategori": "pertanian"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "FeatureCollection"
        assert len(response.data["features"]) == 1

    def test_kategori_filter_returns_only_umkm(self, client, all_potensi):
        response = client.get(URL_POTENSI, {"kategori": "umkm"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["features"]) == 1

    def test_unknown_kategori_returns_400(self, client, db):
        response = client.get(URL_POTENSI, {"kategori": "invalid_kategori"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["status"] == "error"


# ---------------------------------------------------------------------------
# Detail endpoint tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPotensiDetailView:
    def test_pertanian_detail_returns_200_and_feature(self, client, pertanian):
        url = f"/api/public/potensi/pertanian/{pertanian.pk}/"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "Feature"
        assert response.data["properties"]["nama"] == "Sawah Test"

    def test_umkm_detail_returns_200_and_feature(self, client, umkm):
        url = f"/api/public/potensi/umkm/{umkm.pk}/"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "Feature"
        assert response.data["properties"]["nama_usaha"] == "Warung Test"

    def test_wisata_detail_returns_200_and_feature(self, client, wisata):
        url = f"/api/public/potensi/wisata/{wisata.pk}/"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "Feature"

    def test_infrastruktur_detail_returns_200_and_feature(self, client, infrastruktur):
        url = f"/api/public/potensi/infrastruktur/{infrastruktur.pk}/"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "Feature"

    def test_nonexistent_id_returns_404(self, client, db):
        url = "/api/public/potensi/pertanian/999999/"
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["status"] == "error"

    def test_unknown_kategori_returns_404(self, client, db):
        url = "/api/public/potensi/invalid/1/"
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["status"] == "error"

    def test_detail_contains_geometry(self, client, pertanian):
        url = f"/api/public/potensi/pertanian/{pertanian.pk}/"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "geometry" in response.data
        assert response.data["geometry"] is not None


# ---------------------------------------------------------------------------
# Statistics tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestStatistikView:
    def test_statistik_returns_200(self, client, db):
        response = client.get(URL_STATISTIK)
        assert response.status_code == status.HTTP_200_OK

    def test_statistik_has_correct_keys(self, client, db):
        response = client.get(URL_STATISTIK)
        assert response.data["status"] == "ok"
        data = response.data["data"]
        for key in ["pertanian", "umkm", "wisata", "infrastruktur", "total"]:
            assert key in data, f"Missing key: {key}"

    def test_statistik_counts_are_integers(self, client, db):
        response = client.get(URL_STATISTIK)
        data = response.data["data"]
        for key in ["pertanian", "umkm", "wisata", "infrastruktur", "total"]:
            assert isinstance(data[key], int), f"'{key}' must be an int"

    def test_statistik_counts_are_zero_on_empty_db(self, client, db):
        response = client.get(URL_STATISTIK)
        data = response.data["data"]
        assert data["pertanian"] == 0
        assert data["total"] == 0

    def test_statistik_counts_increment_with_objects(self, client, all_potensi):
        response = client.get(URL_STATISTIK)
        data = response.data["data"]
        assert data["pertanian"] == 1
        assert data["umkm"] == 1
        assert data["wisata"] == 1
        assert data["infrastruktur"] == 1
        assert data["total"] == 4


# ---------------------------------------------------------------------------
# Village profile tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestDesaProfileView:
    def test_desa_returns_200(self, client, db):
        response = client.get(URL_DESA)
        assert response.status_code == status.HTTP_200_OK

    def test_desa_has_status_ok(self, client, db):
        response = client.get(URL_DESA)
        assert response.data["status"] == "ok"

    def test_desa_has_expected_profile_keys(self, client, db):
        response = client.get(URL_DESA)
        data = response.data["data"]
        expected_keys = [
            "nama_desa", "kecamatan", "kabupaten", "provinsi",
            "jumlah_penduduk", "luas_wilayah_ha", "jumlah_dusun",
            "visi", "misi", "kontak",
        ]
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"

    def test_desa_nama_is_rambipuji(self, client, db):
        response = client.get(URL_DESA)
        assert response.data["data"]["nama_desa"] == "Rambipuji"

    def test_desa_misi_is_list(self, client, db):
        response = client.get(URL_DESA)
        assert isinstance(response.data["data"]["misi"], list)

    def test_desa_kontak_has_required_keys(self, client, db):
        response = client.get(URL_DESA)
        kontak = response.data["data"]["kontak"]
        for key in ["alamat", "telepon", "email", "jam"]:
            assert key in kontak, f"Missing kontak key: {key}"
