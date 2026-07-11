"""
Service layer for calculating aggregate statistics for potensi categories.

Uses ORM .count() calls so full querysets are never loaded into memory.
Shared across public and admin statistik endpoints.
"""

from __future__ import annotations

from typing import Any

from apps.potensi.models import (
    PotensiInfrastruktur,
    PotensiPertanian,
    PotensiUMKM,
    PotensiWisata,
)


def get_statistik_counts() -> dict[str, Any]:
    """Return aggregate counts per category using .count() ORM calls."""
    jumlah_pertanian: int = PotensiPertanian.objects.count()
    jumlah_umkm: int = PotensiUMKM.objects.count()
    jumlah_wisata: int = PotensiWisata.objects.count()
    jumlah_infrastruktur: int = PotensiInfrastruktur.objects.count()

    return {
        "pertanian": jumlah_pertanian,
        "umkm": jumlah_umkm,
        "wisata": jumlah_wisata,
        "infrastruktur": jumlah_infrastruktur,
        "total": (
            jumlah_pertanian
            + jumlah_umkm
            + jumlah_wisata
            + jumlah_infrastruktur
        ),
    }
