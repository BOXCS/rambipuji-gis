"""
Service module re-exporting import_shapefile from apps.imports.services.import_service.
"""

from apps.imports.services.import_service import (
    ShapefileValidationError,
    import_shapefile,
)

__all__ = ["ShapefileValidationError", "import_shapefile"]
