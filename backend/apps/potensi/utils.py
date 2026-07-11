"""
Shared utilities for the potensi app.

Contains KATEGORI_MAP mapping category slugs to their models and serializers,
shared between public views (views.py) and admin views (admin_views.py).
"""

from __future__ import annotations

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

KATEGORI_MAP: dict[str, tuple] = {
    "pertanian": (
        PotensiPertanian,
        PotensiPertanianListSerializer,
        PotensiPertanianDetailSerializer,
    ),
    "umkm": (
        PotensiUMKM,
        PotensiUMKMListSerializer,
        PotensiUMKMDetailSerializer,
    ),
    "wisata": (
        PotensiWisata,
        PotensiWisataListSerializer,
        PotensiWisataDetailSerializer,
    ),
    "infrastruktur": (
        PotensiInfrastruktur,
        PotensiInfrastrukturListSerializer,
        PotensiInfrastrukturDetailSerializer,
    ),
    "batas-wilayah": (
        BatasWilayah,
        BatasWilayahSerializer,
        BatasWilayahSerializer,
    ),
}
