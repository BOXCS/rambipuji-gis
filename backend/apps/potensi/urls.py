from django.urls import path

from .admin_views import (
    AdminPotensiDetailUpdateDeleteView,
    AdminPotensiListCreateView,
    AdminStatistikView,
)
from .views import (
    BatasWilayahListView,
    DesaProfileView,
    PotensiCombinedListView,
    PotensiDetailView,
    PotensiInfrastrukturListView,
    PotensiPertanianListView,
    PotensiUMKMListView,
    PotensiWisataListView,
    StatistikView,
)

urlpatterns = [
    # Public endpoints (/api/public/...)
    path("public/pertanian/", PotensiPertanianListView.as_view(), name="public-pertanian-list"),
    path("public/umkm/", PotensiUMKMListView.as_view(), name="public-umkm-list"),
    path("public/wisata/", PotensiWisataListView.as_view(), name="public-wisata-list"),
    path("public/infrastruktur/", PotensiInfrastrukturListView.as_view(), name="public-infrastruktur-list"),
    path("public/batas-wilayah/", BatasWilayahListView.as_view(), name="public-batas-wilayah-list"),
    path("public/potensi/", PotensiCombinedListView.as_view(), name="public-potensi-list"),
    path("public/potensi/<str:kategori>/<int:pk>/", PotensiDetailView.as_view(), name="public-potensi-detail"),
    path("public/statistik/", StatistikView.as_view(), name="public-statistik"),
    path("public/desa/", DesaProfileView.as_view(), name="public-desa"),

    # Admin endpoints (/api/admin/...)
    path("admin/potensi/<str:kategori>/", AdminPotensiListCreateView.as_view(), name="admin-potensi-list-create"),
    path("admin/potensi/<str:kategori>/<int:pk>/", AdminPotensiDetailUpdateDeleteView.as_view(), name="admin-potensi-detail-update-delete"),
    path("admin/statistik/", AdminStatistikView.as_view(), name="admin-statistik"),
]

