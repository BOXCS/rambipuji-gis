"""
Admin CRUD viewsets/views for /api/admin/potensi/ and /api/admin/statistik/.

All views in this module require JWT authentication and an admin role
(superadmin or operator).

Endpoints:
  - GET    /api/admin/potensi/{kategori}/        — List all (full detail serializer)
  - POST   /api/admin/potensi/{kategori}/        — Create new entry
  - GET    /api/admin/potensi/{kategori}/{id}/   — Retrieve single entry
  - PUT    /api/admin/potensi/{kategori}/{id}/   — Full update
  - PATCH  /api/admin/potensi/{kategori}/{id}/   — Partial update
  - DELETE /api/admin/potensi/{kategori}/{id}/   — Delete entry
  - GET    /api/admin/statistik/                 — Aggregate counts per category
"""

from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth_admin.permissions import IsAdminRole

from .services.statistik_service import get_statistik_counts
from .utils import KATEGORI_MAP


def _validate_foto_file(file) -> list[str]:
    """Validate uploaded image file: jpeg/png and max size 5MB."""
    errors = []
    if file.size > 5 * 1024 * 1024:
        errors.append("Ukuran file foto maksimal 5MB.")
    content_type = getattr(file, "content_type", "")
    if content_type not in ("image/jpeg", "image/png"):
        errors.append("Format foto harus image/jpeg atau image/png.")
    return errors


class AdminPotensiListCreateView(APIView):
    """GET and POST endpoints for /api/admin/potensi/{kategori}/."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request, kategori: str) -> Response:
        kategori_clean = kategori.strip().lower()
        if kategori_clean not in KATEGORI_MAP:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        model, _, detail_serializer_cls = KATEGORI_MAP[kategori_clean]
        queryset = model.objects.all()
        serializer = detail_serializer_cls(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request, kategori: str) -> Response:
        kategori_clean = kategori.strip().lower()
        if kategori_clean not in KATEGORI_MAP:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        model, _, detail_serializer_cls = KATEGORI_MAP[kategori_clean]

        foto_file = request.FILES.get("foto")
        if foto_file:
            foto_errors = _validate_foto_file(foto_file)
            if foto_errors:
                return Response(
                    {
                        "status": "error",
                        "message": "Validasi gagal",
                        "errors": {"foto": foto_errors},
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )

        serializer = detail_serializer_cls(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Validasi gagal",
                    "errors": serializer.errors,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        if hasattr(model, "foto") and foto_file:
            instance = serializer.save(foto=foto_file)
        else:
            instance = serializer.save()

        response_serializer = detail_serializer_cls(
            instance, context={"request": request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class AdminPotensiDetailUpdateDeleteView(APIView):
    """GET, PUT, PATCH, and DELETE endpoints for /api/admin/potensi/{kategori}/{id}/."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request, kategori: str, pk: int) -> Response:
        kategori_clean = kategori.strip().lower()
        if kategori_clean not in KATEGORI_MAP:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        model, _, detail_serializer_cls = KATEGORI_MAP[kategori_clean]
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = detail_serializer_cls(instance, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request, kategori: str, pk: int) -> Response:
        return self._update(request, kategori, pk, partial=False)

    def patch(self, request: Request, kategori: str, pk: int) -> Response:
        return self._update(request, kategori, pk, partial=True)

    def _update(
        self, request: Request, kategori: str, pk: int, partial: bool
    ) -> Response:
        kategori_clean = kategori.strip().lower()
        if kategori_clean not in KATEGORI_MAP:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        model, _, detail_serializer_cls = KATEGORI_MAP[kategori_clean]
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        foto_file = request.FILES.get("foto")
        if foto_file:
            foto_errors = _validate_foto_file(foto_file)
            if foto_errors:
                return Response(
                    {
                        "status": "error",
                        "message": "Validasi gagal",
                        "errors": {"foto": foto_errors},
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )

        serializer = detail_serializer_cls(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Validasi gagal",
                    "errors": serializer.errors,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        if hasattr(model, "foto") and foto_file:
            serializer.save(foto=foto_file)
        else:
            serializer.save()

        response_serializer = detail_serializer_cls(
            instance, context={"request": request}
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request: Request, kategori: str, pk: int) -> Response:
        kategori_clean = kategori.strip().lower()
        if kategori_clean not in KATEGORI_MAP:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        model, _, _ = KATEGORI_MAP[kategori_clean]
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response(
                {"status": "error", "message": "Data tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND,
            )

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStatistikView(APIView):
    """GET /api/admin/statistik/ — Aggregate counts requiring admin authentication."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        return Response(
            {
                "status": "ok",
                "data": get_statistik_counts(),
            }
        )
