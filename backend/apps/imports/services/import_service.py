"""
Shapefile validation and PostGIS import pipeline.
"""

from __future__ import annotations

import os
import tempfile
import zipfile
from typing import Any

from django.contrib.gis.gdal import CoordTransform, DataSource, SpatialReference
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon, Polygon
from django.db import models, transaction

from apps.imports.models import ImportLog
from apps.potensi.utils import KATEGORI_MAP

ALLOWED_EXTENSIONS = {".shp", ".dbf", ".shx", ".prj", ".cpg", ".qpj"}
REQUIRED_EXTENSIONS = {".shp", ".dbf", ".shx"}
MAX_UNZIPPED_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

ALLOWED_GEOMETRY_NAMES: dict[str, set[str]] = {
    "pertanian": {
        "Point",
        "Point25D",
        "Polygon",
        "Polygon25D",
        "MultiPoint",
        "MultiPoint25D",
        "MultiPolygon",
        "MultiPolygon25D",
    },
    "umkm": {
        "Point",
        "Point25D",
        "MultiPoint",
        "MultiPoint25D",
    },
    "wisata": {
        "Point",
        "Point25D",
        "Polygon",
        "Polygon25D",
        "MultiPoint",
        "MultiPoint25D",
        "MultiPolygon",
        "MultiPolygon25D",
    },
    "infrastruktur": {
        "Point",
        "Point25D",
        "MultiPoint",
        "MultiPoint25D",
    },
    "batas-wilayah": {
        "Polygon",
        "Polygon25D",
        "MultiPolygon",
        "MultiPolygon25D",
    },
}


class ShapefileValidationError(Exception):
    """Raised when an uploaded shapefile fails format, geometry, or CRS validation."""
    pass


def _detect_epsg(srs: SpatialReference | None) -> tuple[int | None, str]:
    """Inspect a GDAL SpatialReference and return (epsg_code, detected_description)."""
    if srs is None:
        return None, "Tidak ada informasi CRS"

    if srs.srid:
        try:
            code = int(srs.srid)
            if code == 4326:
                return 4326, "EPSG:4326"
            if code == 32750:
                return 32750, "EPSG:32750"
            return None, f"EPSG:{code}"
        except (ValueError, TypeError):
            pass

    wkt = srs.wkt.upper() if srs.wkt else ""
    name = srs.name.upper() if srs.name else ""

    if srs.projected:
        if "32750" in wkt or "ZONE 50S" in name:
            return 32750, "EPSG:32750"
        return None, (srs.name or "CRS Proyeksi Tidak Dikenal")
    else:
        if "4326" in wkt or name in ("WGS 84", "GCS_WGS_1984", "WGS_1984") or "WGS_1984" in wkt:
            return 4326, "EPSG:4326"
        return None, (srs.name or "CRS Geografis Tidak Dikenal")


def _extract_nama_wilayah(feature) -> str:
    """Extract village name attribute from batas-wilayah shapefile feature."""
    field_map = {field.lower(): feature.get(field) for field in feature.fields}
    for candidate in ("namobj", "nama", "name", "desa"):
        val = field_map.get(candidate)
        if val is not None and str(val).strip() != "":
            return str(val).strip()
    return "Unknown"


def import_shapefile(file, kategori: str, user=None) -> dict[str, Any]:
    """
    Validate and import a zipped shapefile into PostGIS.
    """
    if kategori not in KATEGORI_MAP:
        raise ShapefileValidationError(f"Kategori '{kategori}' tidak valid.")

    filename = getattr(file, "name", "shapefile.zip")

    # Step 1 — File validation
    if not zipfile.is_zipfile(file):
        raise ShapefileValidationError("File yang diunggah bukan arsip .zip yang valid.")

    with zipfile.ZipFile(file, "r") as zf:
        infolist = zf.infolist()
        total_size = sum(info.file_size for info in infolist)
        if total_size > MAX_UNZIPPED_SIZE_BYTES:
            raise ShapefileValidationError("Ukuran file ZIP setelah diekstrak melebihi batas 50MB.")

        found_exts = set()
        for info in infolist:
            if info.is_dir() or info.filename.endswith("/"):
                continue
            ext = os.path.splitext(info.filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise ShapefileValidationError(
                    f"File ZIP mengandung file dengan ekstensi yang tidak diizinkan: {ext}"
                )
            found_exts.add(ext)

        missing = REQUIRED_EXTENSIONS - found_exts
        if missing:
            raise ShapefileValidationError(
                f"File ZIP kurang komponen shapefile wajib: {', '.join(sorted(missing))}"
            )

        with tempfile.TemporaryDirectory() as tmpdir:
            zf.extractall(tmpdir)

            shp_path = None
            for root, _, files in os.walk(tmpdir):
                for fname in sorted(files):
                    if fname.lower().endswith(".shp"):
                        shp_path = os.path.join(root, fname)
                        break
                if shp_path:
                    break

            if not shp_path:
                raise ShapefileValidationError("File .shp tidak ditemukan di dalam arsip ZIP.")

            try:
                ds = DataSource(shp_path)
            except Exception as exc:
                raise ShapefileValidationError("Gagal membaca file shapefile menggunakan GDAL.") from exc

            if len(ds) == 0:
                raise ShapefileValidationError("Shapefile tidak memiliki layer.")

            layer = ds[0]
            if len(layer) == 0:
                raise ShapefileValidationError("Shapefile tidak memiliki fitur (0 features).")

            # Step 2 — Geometry validation
            allowed_geom_names = ALLOWED_GEOMETRY_NAMES[kategori]
            for feature in layer:
                geom = feature.geom
                if geom is None or geom.empty:
                    raise ShapefileValidationError("Terdapat fitur dengan geometri kosong atau null.")
                geom_type_name = geom.geom_type.name
                if geom_type_name not in allowed_geom_names:
                    raise ShapefileValidationError(
                        f"Tipe geometri {geom_type_name} tidak sesuai untuk kategori '{kategori}'."
                    )

            # Step 3 — CRS validation and reprojection
            epsg_code, detected_name = _detect_epsg(layer.srs)
            if epsg_code == 4326:
                coord_transform = None
            elif epsg_code == 32750:
                target_srs = SpatialReference(4326)
                coord_transform = CoordTransform(layer.srs, target_srs)
            else:
                raise ShapefileValidationError(
                    f"CRS shapefile tidak didukung (terdeteksi: {detected_name}). "
                    "CRS yang diizinkan adalah EPSG:4326 atau EPSG:32750."
                )

            # Step 4 — Import to PostGIS
            model_cls, _, _ = KATEGORI_MAP[kategori]
            instances = []

            for feature in layer:
                geom = feature.geom
                if coord_transform:
                    geom.transform(coord_transform)

                geos_geom = GEOSGeometry(geom.wkt, srid=4326)

                if kategori == "batas-wilayah":
                    if isinstance(geos_geom, Polygon):
                        geos_geom = MultiPolygon(geos_geom, srid=4326)
                    nama_wilayah = _extract_nama_wilayah(feature)
                    inst = model_cls(
                        nama_wilayah=nama_wilayah,
                        jenis="desa",
                        geom=geos_geom,
                    )
                else:
                    kwargs: dict[str, Any] = {"geom": geos_geom}
                    for f in model_cls._meta.fields:
                        if isinstance(f, models.CharField) and f.name != "id":
                            kwargs[f.name] = ""
                    inst = model_cls(**kwargs)

                instances.append(inst)

            with transaction.atomic():
                created = model_cls.objects.bulk_create(instances)
                imported_count = len(created)

                # Step 5 — Audit log
                ImportLog.objects.create(
                    filename=filename,
                    kategori=kategori,
                    imported_count=imported_count,
                    imported_by=user if (user and getattr(user, "is_authenticated", False)) else None,
                )

            return {
                "imported": imported_count,
                "kategori": kategori,
                "filename": filename,
            }
