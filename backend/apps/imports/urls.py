from django.urls import path

from .views import ShapefileImportView

urlpatterns = [
    path("import/shapefile/", ShapefileImportView.as_view(), name="admin-import-shapefile"),
]
