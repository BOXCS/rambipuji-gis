"""
Tests for backend/apps/potensi/serializers.py

These tests verify that every serializer produces valid GeoJSON Feature output
without requiring a live database. Model instances are built with
`Model.from_db()`-style mocks via `unittest.mock.MagicMock` and
`SimpleNamespace` so the test suite can run with:

    pytest apps/potensi/tests/test_serializers.py

GDAL / PostGIS are needed for geometry field construction, so the tests run
inside the Docker container where the system GDAL libraries are available.
"""

from __future__ import annotations

from decimal import Decimal
from types import SimpleNamespace
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from django.contrib.gis.geos import (
    GEOSGeometry,
    MultiPolygon,
    Point,
    Polygon,
)

from apps.potensi.serializers import (
    BatasWilayahSerializer,
    PotensiInfrastrukturDetailSerializer,
    PotensiInfrastrukturListSerializer,
    PotensiPertanianDetailSerializer,
    PotensiPertanianListSerializer,
    PotensiUMKMDetailSerializer,
    PotensiUMKMListSerializer,
    PotensiWisataDetailSerializer,
    PotensiWisataListSerializer,
)


# ---------------------------------------------------------------------------
# Shared geometry fixtures
# ---------------------------------------------------------------------------

POINT_GEOM = Point(112.5, -8.2, srid=4326)
POLYGON_GEOM = Polygon(
    ((112.0, -8.0), (112.1, -8.0), (112.1, -8.1), (112.0, -8.1), (112.0, -8.0)),
    srid=4326,
)
MULTIPOLYGON_GEOM = MultiPolygon(POLYGON_GEOM, srid=4326)


# ---------------------------------------------------------------------------
# Helper — build a fake model instance via MagicMock
# ---------------------------------------------------------------------------

def _fake_instance(**kwargs: Any) -> MagicMock:
    """Return a MagicMock whose attribute access returns kwargs values."""
    instance = MagicMock()
    for key, value in kwargs.items():
        setattr(instance, key, value)
    # foto returns a falsy value by default (no file uploaded)
    if "foto" not in kwargs:
        instance.foto = None
    return instance


def _serialize(serializer_cls, instance, many: bool = False) -> dict:
    """Instantiate a serializer with no request context and return .data as dict."""
    serializer = serializer_cls(instance, context={"request": None})
    # Convert ReturnDict / OrderedDict to plain dict
    return dict(serializer.data)


# ---------------------------------------------------------------------------
# Assertion helper
# ---------------------------------------------------------------------------

def _assert_geojson_feature(data: dict) -> None:
    """Assert that the output is a valid GeoJSON Feature."""
    assert data.get("type") == "Feature", (
        f"Expected 'type' == 'Feature', got {data.get('type')!r}"
    )
    assert "geometry" in data, "GeoJSON Feature must have a 'geometry' key"
    assert data["geometry"] is not None, "'geometry' must not be None"
    assert "properties" in data, "GeoJSON Feature must have a 'properties' key"


# ---------------------------------------------------------------------------
# PotensiPertanian
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPotensiPertanianListSerializer:
    def test_produces_geojson_feature(self):
        instance = _fake_instance(
            id=1,
            nama="Sawah Dusun Krajan",
            geom=POLYGON_GEOM,
            foto=None,
        )
        data = _serialize(PotensiPertanianListSerializer, instance)
        _assert_geojson_feature(data)

    def test_properties_contain_nama(self):
        instance = _fake_instance(
            id=1,
            nama="Sawah Dusun Krajan",
            geom=POINT_GEOM,
            foto=None,
        )
        data = _serialize(PotensiPertanianListSerializer, instance)
        assert data["properties"]["nama"] == "Sawah Dusun Krajan"

    def test_foto_is_none_when_no_file(self):
        instance = _fake_instance(id=1, nama="Test", geom=POINT_GEOM, foto=None)
        data = _serialize(PotensiPertanianListSerializer, instance)
        assert data["properties"]["foto"] is None


@pytest.mark.django_db
class TestPotensiPertanianDetailSerializer:
    def test_produces_geojson_feature(self):
        from datetime import datetime
        instance = _fake_instance(
            id=1,
            nama="Kebun Pisang",
            komoditas="Pisang",
            luas_ha=Decimal("2.50"),
            nama_pemilik="Pak Budi",
            kontak="08123456789",
            hasil_panen="2 ton/bulan",
            musim_tanam="Sepanjang tahun",
            geom=POLYGON_GEOM,
            foto=None,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(PotensiPertanianDetailSerializer, instance)
        _assert_geojson_feature(data)

    def test_contains_all_detail_fields(self):
        from datetime import datetime
        instance = _fake_instance(
            id=1,
            nama="Kebun Pisang",
            komoditas="Pisang",
            luas_ha=Decimal("2.50"),
            nama_pemilik="Pak Budi",
            kontak="08123456789",
            hasil_panen="2 ton/bulan",
            musim_tanam="Sepanjang tahun",
            geom=POLYGON_GEOM,
            foto=None,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(PotensiPertanianDetailSerializer, instance)
        props = data["properties"]
        for field in ["nama", "komoditas", "luas_ha", "nama_pemilik", "kontak",
                      "hasil_panen", "musim_tanam"]:
            assert field in props, f"Expected field '{field}' in properties"


# ---------------------------------------------------------------------------
# PotensiUMKM
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPotensiUMKMListSerializer:
    def test_produces_geojson_feature(self):
        instance = _fake_instance(
            id=2,
            nama_usaha="Warung Bu Sari",
            geom=POINT_GEOM,
            foto=None,
        )
        data = _serialize(PotensiUMKMListSerializer, instance)
        _assert_geojson_feature(data)

    def test_properties_contain_nama_usaha(self):
        instance = _fake_instance(
            id=2,
            nama_usaha="Warung Bu Sari",
            geom=POINT_GEOM,
            foto=None,
        )
        data = _serialize(PotensiUMKMListSerializer, instance)
        assert data["properties"]["nama_usaha"] == "Warung Bu Sari"


@pytest.mark.django_db
class TestPotensiUMKMDetailSerializer:
    def test_produces_geojson_feature(self):
        from datetime import datetime
        instance = _fake_instance(
            id=2,
            nama_usaha="Warung Bu Sari",
            jenis_produk="Makanan",
            nama_pemilik="Bu Sari",
            kontak="08198765432",
            jam_operasional="07.00 - 21.00",
            deskripsi="Warung makan sederhana",
            geom=POINT_GEOM,
            foto=None,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(PotensiUMKMDetailSerializer, instance)
        _assert_geojson_feature(data)


# ---------------------------------------------------------------------------
# PotensiWisata
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPotensiWisataListSerializer:
    def test_produces_geojson_feature(self):
        instance = _fake_instance(
            id=3,
            nama="Air Terjun Rambipuji",
            geom=POINT_GEOM,
            foto=None,
        )
        data = _serialize(PotensiWisataListSerializer, instance)
        _assert_geojson_feature(data)


@pytest.mark.django_db
class TestPotensiWisataDetailSerializer:
    def test_produces_geojson_feature(self):
        from datetime import datetime
        instance = _fake_instance(
            id=3,
            nama="Air Terjun Rambipuji",
            deskripsi="Wisata alam",
            jam_kunjungan="08.00 - 17.00",
            harga_tiket="Gratis",
            kontak="08111111111",
            geom=POINT_GEOM,
            foto=None,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(PotensiWisataDetailSerializer, instance)
        _assert_geojson_feature(data)


# ---------------------------------------------------------------------------
# PotensiInfrastruktur
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPotensiInfrastrukturListSerializer:
    def test_produces_geojson_feature(self):
        instance = _fake_instance(
            id=4,
            nama="Balai Desa Rambipuji",
            geom=POINT_GEOM,
        )
        data = _serialize(PotensiInfrastrukturListSerializer, instance)
        _assert_geojson_feature(data)

    def test_list_does_not_expose_detail_fields(self):
        instance = _fake_instance(
            id=4,
            nama="Balai Desa Rambipuji",
            geom=POINT_GEOM,
        )
        data = _serialize(PotensiInfrastrukturListSerializer, instance)
        props = data["properties"]
        assert "kondisi" not in props
        assert "pengelola" not in props


@pytest.mark.django_db
class TestPotensiInfrastrukturDetailSerializer:
    def test_produces_geojson_feature(self):
        from datetime import datetime
        instance = _fake_instance(
            id=4,
            nama="Balai Desa Rambipuji",
            jenis_fasilitas="Pemerintahan",
            kondisi="Baik",
            kapasitas="200 orang",
            pengelola="Pemerintah Desa",
            geom=POINT_GEOM,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(PotensiInfrastrukturDetailSerializer, instance)
        _assert_geojson_feature(data)


# ---------------------------------------------------------------------------
# BatasWilayah
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestBatasWilayahSerializer:
    def test_produces_geojson_feature(self):
        from datetime import datetime
        instance = _fake_instance(
            id=5,
            nama_wilayah="Desa Rambipuji",
            jenis="desa",
            luas_ha=Decimal("450.75"),
            kode_wilayah="35090101",
            geom=MULTIPOLYGON_GEOM,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(BatasWilayahSerializer, instance)
        _assert_geojson_feature(data)

    def test_properties_contain_nama_wilayah(self):
        from datetime import datetime
        instance = _fake_instance(
            id=5,
            nama_wilayah="Desa Rambipuji",
            jenis="desa",
            luas_ha=Decimal("450.75"),
            kode_wilayah="35090101",
            geom=MULTIPOLYGON_GEOM,
            created_at=datetime(2026, 1, 1),
            updated_at=datetime(2026, 1, 2),
        )
        data = _serialize(BatasWilayahSerializer, instance)
        assert data["properties"]["nama_wilayah"] == "Desa Rambipuji"
        assert data["properties"]["jenis"] == "desa"
