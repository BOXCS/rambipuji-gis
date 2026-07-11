from __future__ import annotations

import logging

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth_admin.permissions import IsAdminRole
from apps.imports.services.import_service import (
    ShapefileValidationError,
    import_shapefile,
)
from apps.potensi.utils import KATEGORI_MAP

logger = logging.getLogger(__name__)


class ShapefileImportView(APIView):
    """
    POST /api/admin/import/shapefile/
    JWT-protected endpoint to upload and import a zipped shapefile into PostGIS.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"status": "error", "message": "File shapefile (.zip) wajib diunggah."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        kategori = str(request.data.get("kategori", "")).strip()
        if kategori not in KATEGORI_MAP:
            return Response(
                {"status": "error", "message": f"Kategori '{kategori}' tidak valid."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            result = import_shapefile(file_obj, kategori, user=request.user)
            return Response(
                {"status": "ok", "data": result},
                status=status.HTTP_200_OK,
            )
        except ShapefileValidationError as exc:
            return Response(
                {"status": "error", "message": str(exc)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        except Exception:
            logger.exception("Unexpected error during shapefile import")
            return Response(
                {
                    "status": "error",
                    "message": "Import gagal. Hubungi administrator.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
