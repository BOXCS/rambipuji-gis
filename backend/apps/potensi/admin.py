from django.contrib.gis import admin
from .models import (
    PotensiPertanian,
    PotensiUMKM,
    PotensiWisata,
    PotensiInfrastruktur,
    BatasWilayah,
)

# GISModelAdmin provides an OpenLayers map widget for geometry fields in the admin UI.
GeoModelAdmin = admin.GISModelAdmin


@admin.register(PotensiPertanian)
class PotensiPertanianAdmin(GeoModelAdmin):
    list_display = ("nama", "komoditas", "luas_ha", "nama_pemilik", "created_at")
    search_fields = ("nama", "komoditas", "nama_pemilik")
    list_filter = ("komoditas", "musim_tanam")


@admin.register(PotensiUMKM)
class PotensiUMKMAdmin(GeoModelAdmin):
    list_display = ("nama_usaha", "jenis_produk", "nama_pemilik", "kontak", "created_at")
    search_fields = ("nama_usaha", "jenis_produk", "nama_pemilik")
    list_filter = ("jenis_produk",)


@admin.register(PotensiWisata)
class PotensiWisataAdmin(GeoModelAdmin):
    list_display = ("nama", "jam_kunjungan", "harga_tiket", "created_at")
    search_fields = ("nama", "deskripsi")


@admin.register(PotensiInfrastruktur)
class PotensiInfrastrukturAdmin(GeoModelAdmin):
    list_display = ("nama", "jenis_fasilitas", "kondisi", "pengelola", "created_at")
    search_fields = ("nama", "jenis_fasilitas", "pengelola")
    list_filter = ("jenis_fasilitas", "kondisi")


@admin.register(BatasWilayah)
class BatasWilayahAdmin(GeoModelAdmin):
    list_display = ("nama_wilayah", "jenis", "luas_ha", "kode_wilayah", "created_at")
    search_fields = ("nama_wilayah", "kode_wilayah")
    list_filter = ("jenis",)
