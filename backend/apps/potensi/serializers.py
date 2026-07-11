from __future__ import annotations

from typing import Optional

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from .models import (
    BatasWilayah,
    PotensiInfrastruktur,
    PotensiPertanian,
    PotensiUMKM,
    PotensiWisata,
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _build_foto_url(instance, request) -> Optional[str]:
    """Return an absolute URL for a foto ImageField or None if empty.

    Uses request.build_absolute_uri() then replaces internal Docker hostname
    with PUBLIC_BASE_URL so the URL is correct when accessed by the browser.
    """
    if not instance.foto:
        return None
    from django.conf import settings
    public_base = getattr(settings, "PUBLIC_BASE_URL", None)
    if request:
        url = request.build_absolute_uri(instance.foto.url)
        if public_base:
            import re
            url = re.sub(r"^https?://[^/]+", public_base.rstrip("/"), url)
        return url
    if public_base and hasattr(instance.foto, "url"):
        return f"{public_base.rstrip('/')}{instance.foto.url}"
    if hasattr(instance.foto, "url"):
        return instance.foto.url
    return str(instance.foto)


# ---------------------------------------------------------------------------
# PotensiPertanian
# ---------------------------------------------------------------------------

class PotensiPertanianListSerializer(GeoFeatureModelSerializer):
    """Lightweight list/map serializer for public endpoints and Leaflet overlays."""

    foto = serializers.SerializerMethodField()
    kategori = serializers.SerializerMethodField()

    class Meta:
        model = PotensiPertanian
        geo_field = "geom"
        fields = ["id", "nama", "kategori", "foto", "geom"]

    def get_foto(self, instance: PotensiPertanian) -> Optional[str]:
        request = self.context.get("request")
        return _build_foto_url(instance, request)

    def get_kategori(self, instance: PotensiPertanian) -> str:
        return "pertanian"


class PotensiPertanianDetailSerializer(GeoFeatureModelSerializer):
    """Full serializer for detail and admin endpoints."""

    foto = serializers.SerializerMethodField()
    kategori = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    # Attribute fields are optional so staff can add a point first
    # and fill in details later (project-overview.md success criterion 3).
    komoditas = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    luas_ha = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    nama_pemilik = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    hasil_panen = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    musim_tanam = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )

    class Meta:
        model = PotensiPertanian
        geo_field = "geom"
        fields = [
            "id",
            "nama",
            "kategori",
            "komoditas",
            "luas_ha",
            "nama_pemilik",
            "kontak",
            "hasil_panen",
            "musim_tanam",
            "foto",
            "geom",
            "created_at",
            "updated_at",
        ]

    def get_foto(self, instance: PotensiPertanian) -> Optional[str]:
        request = self.context.get("request")
        return _build_foto_url(instance, request)

    def get_kategori(self, instance: PotensiPertanian) -> str:
        return "pertanian"


# ---------------------------------------------------------------------------
# PotensiUMKM
# ---------------------------------------------------------------------------

class PotensiUMKMListSerializer(GeoFeatureModelSerializer):
    """Lightweight list/map serializer for public endpoints and Leaflet overlays."""

    foto = serializers.SerializerMethodField()
    kategori = serializers.SerializerMethodField()

    class Meta:
        model = PotensiUMKM
        geo_field = "geom"
        fields = ["id", "nama_usaha", "kategori", "foto", "geom"]

    def get_foto(self, instance: PotensiUMKM) -> Optional[str]:
        request = self.context.get("request")
        return _build_foto_url(instance, request)

    def get_kategori(self, instance: PotensiUMKM) -> str:
        return "umkm"


class PotensiUMKMDetailSerializer(GeoFeatureModelSerializer):
    """Full serializer for detail and admin endpoints."""

    foto = serializers.SerializerMethodField()
    kategori = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    # Attribute fields are optional so staff can add a point first
    # and fill in details later (project-overview.md success criterion 3).
    jenis_produk = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    nama_pemilik = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    jam_operasional = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )

    class Meta:
        model = PotensiUMKM
        geo_field = "geom"
        fields = [
            "id",
            "nama_usaha",
            "kategori",
            "jenis_produk",
            "nama_pemilik",
            "kontak",
            "jam_operasional",
            "foto",
            "deskripsi",
            "geom",
            "created_at",
            "updated_at",
        ]

    def get_foto(self, instance: PotensiUMKM) -> Optional[str]:
        request = self.context.get("request")
        return _build_foto_url(instance, request)

    def get_kategori(self, instance: PotensiUMKM) -> str:
        return "umkm"


# ---------------------------------------------------------------------------
# PotensiWisata
# ---------------------------------------------------------------------------

class PotensiWisataListSerializer(GeoFeatureModelSerializer):
    """Lightweight list/map serializer for public endpoints and Leaflet overlays."""

    foto = serializers.SerializerMethodField()
    kategori = serializers.SerializerMethodField()

    class Meta:
        model = PotensiWisata
        geo_field = "geom"
        fields = ["id", "nama", "kategori", "foto", "geom"]

    def get_foto(self, instance: PotensiWisata) -> Optional[str]:
        request = self.context.get("request")
        return _build_foto_url(instance, request)

    def get_kategori(self, instance: PotensiWisata) -> str:
        return "wisata"


class PotensiWisataDetailSerializer(GeoFeatureModelSerializer):
    """Full serializer for detail and admin endpoints."""

    foto = serializers.SerializerMethodField()
    kategori = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    # Attribute fields are optional so staff can add a point first
    # and fill in details later (project-overview.md success criterion 3).
    jam_kunjungan = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    harga_tiket = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )

    class Meta:
        model = PotensiWisata
        geo_field = "geom"
        fields = [
            "id",
            "nama",
            "kategori",
            "deskripsi",
            "jam_kunjungan",
            "harga_tiket",
            "foto",
            "kontak",
            "geom",
            "created_at",
            "updated_at",
        ]

    def get_foto(self, instance: PotensiWisata) -> Optional[str]:
        request = self.context.get("request")
        return _build_foto_url(instance, request)

    def get_kategori(self, instance: PotensiWisata) -> str:
        return "wisata"


# ---------------------------------------------------------------------------
# PotensiInfrastruktur
# ---------------------------------------------------------------------------

class PotensiInfrastrukturListSerializer(GeoFeatureModelSerializer):
    """Lightweight list/map serializer for public endpoints and Leaflet overlays.

    PotensiInfrastruktur has no foto field; list payload includes nama + geom + kategori.
    """

    kategori = serializers.SerializerMethodField()

    class Meta:
        model = PotensiInfrastruktur
        geo_field = "geom"
        fields = ["id", "nama", "kategori", "geom"]

    def get_kategori(self, instance: PotensiInfrastruktur) -> str:
        return "infrastruktur"


class PotensiInfrastrukturDetailSerializer(GeoFeatureModelSerializer):
    """Full serializer for detail and admin endpoints."""

    kategori = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    # Attribute fields are optional so staff can add a point first
    # and fill in details later (project-overview.md success criterion 3).
    jenis_fasilitas = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    kondisi = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    kapasitas = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )
    pengelola = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, default=""
    )

    class Meta:
        model = PotensiInfrastruktur
        geo_field = "geom"
        fields = [
            "id",
            "nama",
            "kategori",
            "jenis_fasilitas",
            "kondisi",
            "kapasitas",
            "pengelola",
            "geom",
            "created_at",
            "updated_at",
        ]

    def get_kategori(self, instance: PotensiInfrastruktur) -> str:
        return "infrastruktur"


# ---------------------------------------------------------------------------
# BatasWilayah (single serializer — boundary layer, no foto, no list variant)
# ---------------------------------------------------------------------------

class BatasWilayahSerializer(GeoFeatureModelSerializer):
    """Serializer for administrative boundary polygons.

    Used for both list and detail endpoints; the boundary dataset is small
    and the full attribute set is always needed by the frontend layer control.
    """

    kategori = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = BatasWilayah
        geo_field = "geom"
        fields = [
            "id",
            "nama_wilayah",
            "kategori",
            "jenis",
            "luas_ha",
            "kode_wilayah",
            "geom",
            "created_at",
            "updated_at",
        ]

    def get_kategori(self, instance: BatasWilayah) -> str:
        return "batas-wilayah"
