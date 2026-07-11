"""
Tests for backend/apps/imports/services/import_service.py (Unit 10).

Test cases:
  - Valid Point shapefile for umkm imports successfully and returns count
  - Valid MultiPolygon shapefile for batas-wilayah imports and populates nama_wilayah
  - Zip missing .dbf file is rejected with clear error message
  - Shapefile with zero features is rejected
  - Shapefile with wrong geometry type for kategori is rejected
  - Shapefile with unsupported CRS (e.g. EPSG:3857) is rejected with message stating detected CRS
  - Import is rolled back entirely if a database error occurs mid-import
  - ImportLog record is created after successful import
"""

from __future__ import annotations

import io
import json
import os
import subprocess
import tempfile
import zipfile
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import DatabaseError

from apps.imports.models import ImportLog
from apps.imports.services.import_service import (
    ShapefileValidationError,
    import_shapefile,
)
from apps.potensi.models import BatasWilayah, PotensiUMKM

AdminUser = get_user_model()


def make_shapefile_zip(
    features: list[dict],
    srs_wkt: str | None = None,
    missing_ext: str | None = None,
    extra_files: dict[str, bytes] | None = None,
) -> SimpleUploadedFile:
    """Generate an in-memory uploaded ZIP containing a shapefile created via GDAL."""
    with tempfile.TemporaryDirectory() as tmpdir:
        geojson = {"type": "FeatureCollection", "features": features}
        geojson_path = os.path.join(tmpdir, "input.geojson")
        with open(geojson_path, "w", encoding="utf-8") as f:
            json.dump(geojson, f)

        out_shp = os.path.join(tmpdir, "out.shp")
        subprocess.run(
            ["ogr2ogr", "-f", "ESRI Shapefile", out_shp, geojson_path],
            check=True,
        )

        if srs_wkt:
            prj_path = os.path.join(tmpdir, "out.prj")
            with open(prj_path, "w", encoding="utf-8") as f:
                f.write(srs_wkt)

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            for fname in sorted(os.listdir(tmpdir)):
                if fname.startswith("out."):
                    ext = os.path.splitext(fname)[1].lower()
                    if missing_ext and ext == missing_ext.lower():
                        continue
                    zf.write(os.path.join(tmpdir, fname), arcname=fname)
            if extra_files:
                for name, content in extra_files.items():
                    zf.writestr(name, content)

        buf.seek(0)
        return SimpleUploadedFile(
            name="test_shapefile.zip",
            content=buf.getvalue(),
            content_type="application/zip",
        )


@pytest.fixture
def operator_user(db):
    return AdminUser.objects.create_user(
        username="op_test",
        email="op@rambipuji.desa.id",
        password="Password123!",
        role="operator",
    )


@pytest.mark.django_db
class TestImportService:
    def test_valid_point_shapefile_for_umkm_imports_successfully(self, operator_user):
        features = [
            {
                "type": "Feature",
                "properties": {"name": "Toko A"},
                "geometry": {"type": "Point", "coordinates": [112.5, -8.2]},
            },
            {
                "type": "Feature",
                "properties": {"name": "Toko B"},
                "geometry": {"type": "Point", "coordinates": [112.51, -8.21]},
            },
        ]
        file_obj = make_shapefile_zip(features)
        result = import_shapefile(file_obj, "umkm", user=operator_user)

        assert result["imported"] == 2
        assert result["kategori"] == "umkm"
        assert PotensiUMKM.objects.count() == 2

    def test_valid_multipolygon_shapefile_for_batas_wilayah_populates_nama_wilayah(self, operator_user):
        features = [
            {
                "type": "Feature",
                "properties": {"NAMOBJ": "Desa Rambipuji"},
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [
                            [
                                [112.0, -8.0],
                                [112.1, -8.0],
                                [112.1, -8.1],
                                [112.0, -8.1],
                                [112.0, -8.0],
                            ]
                        ]
                    ],
                },
            }
        ]
        file_obj = make_shapefile_zip(features)
        result = import_shapefile(file_obj, "batas-wilayah", user=operator_user)

        assert result["imported"] == 1
        bw = BatasWilayah.objects.first()
        assert bw is not None
        assert bw.nama_wilayah == "Desa Rambipuji"

    def test_zip_missing_dbf_is_rejected_with_clear_error_message(self, operator_user):
        features = [
            {
                "type": "Feature",
                "properties": {"name": "Toko A"},
                "geometry": {"type": "Point", "coordinates": [112.5, -8.2]},
            }
        ]
        file_obj = make_shapefile_zip(features, missing_ext=".dbf")
        with pytest.raises(ShapefileValidationError) as exc_info:
            import_shapefile(file_obj, "umkm", user=operator_user)
        assert ".dbf" in str(exc_info.value).lower()

    def test_shapefile_with_zero_features_is_rejected(self, operator_user):
        features = []
        file_obj = make_shapefile_zip(features)
        with pytest.raises(ShapefileValidationError) as exc_info:
            import_shapefile(file_obj, "umkm", user=operator_user)
        assert "0 features" in str(exc_info.value).lower() or "tidak memiliki fitur" in str(exc_info.value).lower()

    def test_shapefile_with_wrong_geometry_type_is_rejected(self, operator_user):
        # Point geometry passed for batas-wilayah (expects Polygon / MultiPolygon)
        features = [
            {
                "type": "Feature",
                "properties": {"NAMOBJ": "Desa X"},
                "geometry": {"type": "Point", "coordinates": [112.5, -8.2]},
            }
        ]
        file_obj = make_shapefile_zip(features)
        with pytest.raises(ShapefileValidationError) as exc_info:
            import_shapefile(file_obj, "batas-wilayah", user=operator_user)
        assert "tipe geometri" in str(exc_info.value).lower()

    def test_shapefile_with_unsupported_crs_is_rejected(self, operator_user):
        # EPSG:3857 WKT
        epsg3857_wkt = (
            'PROJCS["WGS 84 / Pseudo-Mercator",'
            'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],'
            'PRIMEM["Greenwich",0],UNIT["Degree",0.0174532925199433]],'
            'PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],'
            'PARAMETER["scale_factor",1],PARAMETER["false_easting",0],'
            'PARAMETER["false_northing",0],UNIT["Meter",1],AUTHORITY["EPSG","3857"]]'
        )
        features = [
            {
                "type": "Feature",
                "properties": {"name": "Toko A"},
                "geometry": {"type": "Point", "coordinates": [112.5, -8.2]},
            }
        ]
        file_obj = make_shapefile_zip(features, srs_wkt=epsg3857_wkt)
        with pytest.raises(ShapefileValidationError) as exc_info:
            import_shapefile(file_obj, "umkm", user=operator_user)
        assert "crs shapefile tidak didukung" in str(exc_info.value).lower()

    def test_import_is_rolled_back_entirely_on_database_error(self, operator_user):
        features = [
            {
                "type": "Feature",
                "properties": {"name": "Toko A"},
                "geometry": {"type": "Point", "coordinates": [112.5, -8.2]},
            }
        ]
        file_obj = make_shapefile_zip(features)
        with patch.object(PotensiUMKM.objects, "bulk_create", side_effect=DatabaseError("DB Fail")):
            with pytest.raises(DatabaseError):
                import_shapefile(file_obj, "umkm", user=operator_user)

        assert PotensiUMKM.objects.count() == 0
        assert ImportLog.objects.count() == 0

    def test_import_log_record_created_after_successful_import(self, operator_user):
        features = [
            {
                "type": "Feature",
                "properties": {"name": "Toko Log"},
                "geometry": {"type": "Point", "coordinates": [112.5, -8.2]},
            }
        ]
        file_obj = make_shapefile_zip(features)
        result = import_shapefile(file_obj, "umkm", user=operator_user)

        log = ImportLog.objects.first()
        assert log is not None
        assert log.kategori == "umkm"
        assert log.imported_count == 1
        assert log.imported_by == operator_user
