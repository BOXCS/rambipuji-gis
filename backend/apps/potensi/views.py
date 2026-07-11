"""
Public read-only views for /api/public/ endpoints.

All views in this module are public (AllowAny) and return either:
  - GeoJSON FeatureCollection  — spatial endpoints consumed by Leaflet
  - JSON envelope              — { status, data } for non-spatial endpoints

Architecture rules observed:
  - Views delegate only to serializers and ORM .count()/.filter() calls
  - No business logic here — spatial filtering helpers go to backend/services/
  - request context is always passed to serializers for absolute foto URLs
  - Never use fields="__all__" and never load full querysets for count-only stats
"""

from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .data.desa_profile import DESA_PROFILE
from .models import (
    BatasWilayah,
    PotensiInfrastruktur,
    PotensiPertanian,
    PotensiUMKM,
    PotensiWisata,
)
from .serializers import (
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
from .services.statistik_service import get_statistik_counts
from .utils import KATEGORI_MAP


def _build_feature_collection(features: list[dict]) -> dict[str, Any]:
    """Wrap a list of GeoJSON Feature dicts into a FeatureCollection."""
    return {
        "type": "FeatureCollection",
        "features": features,
    }


def _serialize_queryset(queryset, serializer_cls, request: Request) -> list[dict]:
    """Serialize a queryset with request context and return a list of Feature dicts."""
    serializer = serializer_cls(queryset, many=True, context={"request": request})
    return list(serializer.data.get("features", []))


# ---------------------------------------------------------------------------
# Per-category list endpoints
# ---------------------------------------------------------------------------

class PotensiPertanianListView(APIView):
    """GET /api/public/pertanian/ — list all Pertanian features as GeoJSON."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        queryset = PotensiPertanian.objects.all()
        serializer = PotensiPertanianListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class PotensiUMKMListView(APIView):
    """GET /api/public/umkm/ — list all UMKM features as GeoJSON."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        queryset = PotensiUMKM.objects.all()
        serializer = PotensiUMKMListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class PotensiWisataListView(APIView):
    """GET /api/public/wisata/ — list all Wisata features as GeoJSON."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        queryset = PotensiWisata.objects.all()
        serializer = PotensiWisataListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class PotensiInfrastrukturListView(APIView):
    """GET /api/public/infrastruktur/ — list all Infrastruktur features as GeoJSON."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        queryset = PotensiInfrastruktur.objects.all()
        serializer = PotensiInfrastrukturListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class BatasWilayahListView(APIView):
    """GET /api/public/batas-wilayah/ — list all boundary polygons as GeoJSON."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        queryset = BatasWilayah.objects.all()
        serializer = BatasWilayahSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Combined list with optional ?kategori= filter
# ---------------------------------------------------------------------------

class PotensiCombinedListView(APIView):
    """GET /api/public/potensi/ — all potensi merged into one FeatureCollection.

    Optional query parameter:
      ?kategori=pertanian|umkm|wisata|infrastruktur
        → Returns only features of that category.

    Returns a standard GeoJSON FeatureCollection consumed directly by Leaflet.
    Returns 400 if an unknown kategori value is provided.
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        kategori_param: str = request.query_params.get("kategori", "").strip().lower()

        if kategori_param:
            if kategori_param not in KATEGORI_MAP:
                return Response(
                    {
                        "status": "error",
                        "message": (
                            f"Kategori '{kategori_param}' tidak dikenal. "
                            f"Pilih salah satu: {', '.join(KATEGORI_MAP.keys())}."
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            model, list_serializer_cls, _ = KATEGORI_MAP[kategori_param]
            features = _serialize_queryset(
                model.objects.all(), list_serializer_cls, request
            )
        else:
            # Merge all categories into a single FeatureCollection
            features = []
            for model, list_serializer_cls, _ in KATEGORI_MAP.values():
                features.extend(
                    _serialize_queryset(model.objects.all(), list_serializer_cls, request)
                )

        return Response(_build_feature_collection(features))


# ---------------------------------------------------------------------------
# Detail endpoint — /api/public/potensi/{kategori}/{id}/
# ---------------------------------------------------------------------------

class PotensiDetailView(APIView):
    """GET /api/public/potensi/{kategori}/{id}/ — single feature detail.

    Returns a GeoJSON Feature with full attribute set.
    Returns 404 if kategori is unknown or the object does not exist.
    """

    permission_classes = [AllowAny]

    def get(self, request: Request, kategori: str, pk: int) -> Response:
        kategori_clean = kategori.strip().lower()

        if kategori_clean not in KATEGORI_MAP:
            return Response(
                {
                    "status": "error",
                    "message": (
                        f"Kategori '{kategori_clean}' tidak dikenal. "
                        f"Pilih salah satu: {', '.join(KATEGORI_MAP.keys())}."
                    ),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        model, _, detail_serializer_cls = KATEGORI_MAP[kategori_clean]

        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "message": f"Data {kategori_clean} dengan id {pk} tidak ditemukan.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = detail_serializer_cls(instance, context={"request": request})
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Statistics endpoint
# ---------------------------------------------------------------------------

class StatistikView(APIView):
    """GET /api/public/statistik/ — aggregate counts per category.

    Uses .count() via statistik_service.
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "status": "ok",
                "data": get_statistik_counts(),
            }
        )


# ---------------------------------------------------------------------------
# Village profile endpoint
# ---------------------------------------------------------------------------

class DesaProfileView(APIView):
    """GET /api/public/desa/ — static village profile data.

    Data is sourced from apps/potensi/data/desa_profile.py.
    When a database-backed village profile model is added in a future phase,
    this view will be updated to query it instead.
    """

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response({"status": "ok", "data": DESA_PROFILE})
