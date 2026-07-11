from __future__ import annotations

from django.conf import settings
from django.db import models


class ImportLog(models.Model):
    """Audit log record for successful shapefile imports."""

    filename = models.CharField("Nama File", max_length=255)
    kategori = models.CharField("Kategori", max_length=50)
    imported_count = models.PositiveIntegerField("Jumlah Data Diimpor")
    imported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Diimpor Oleh",
    )
    imported_at = models.DateTimeField("Waktu Import", auto_now_add=True)

    class Meta:
        db_table = "imports_import_log"
        verbose_name = "Log Import Shapefile"
        verbose_name_plural = "Log Import Shapefile"
        ordering = ["-imported_at"]

    def __str__(self) -> str:
        return f"{self.filename} ({self.kategori}) - {self.imported_count} row(s)"
