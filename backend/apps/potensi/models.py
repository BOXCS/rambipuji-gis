from django.contrib.gis.db import models


class PotensiPertanian(models.Model):
    nama = models.CharField("Nama Potensi", max_length=255)
    komoditas = models.CharField("Komoditas", max_length=255)
    luas_ha = models.DecimalField(
        "Luas (Ha)", max_digits=10, decimal_places=2, null=True, blank=True
    )
    nama_pemilik = models.CharField("Nama Pemilik", max_length=255, blank=True)
    kontak = models.CharField("Kontak", max_length=100, blank=True)
    hasil_panen = models.CharField("Hasil Panen", max_length=255, blank=True)
    musim_tanam = models.CharField("Musim Tanam", max_length=255, blank=True)
    foto = models.ImageField("Foto", upload_to="foto/", null=True, blank=True)
    geom = models.GeometryField("Geometri", srid=4326)
    created_at = models.DateTimeField("Dibuat Pada", auto_now_add=True)
    updated_at = models.DateTimeField("Diperbarui Pada", auto_now=True)

    class Meta:
        db_table = "potensi_pertanian"
        verbose_name = "Potensi Pertanian"
        verbose_name_plural = "Potensi Pertanian"

    def __str__(self) -> str:
        return self.nama


class PotensiUMKM(models.Model):
    nama_usaha = models.CharField("Nama Usaha", max_length=255)
    jenis_produk = models.CharField("Jenis Produk", max_length=255)
    nama_pemilik = models.CharField("Nama Pemilik", max_length=255)
    kontak = models.CharField("Kontak", max_length=100, blank=True)
    jam_operasional = models.CharField("Jam Operasional", max_length=255, blank=True)
    foto = models.ImageField("Foto", upload_to="foto/", null=True, blank=True)
    deskripsi = models.TextField("Deskripsi", blank=True)
    geom = models.PointField("Titik Lokasi", srid=4326)
    created_at = models.DateTimeField("Dibuat Pada", auto_now_add=True)
    updated_at = models.DateTimeField("Diperbarui Pada", auto_now=True)

    class Meta:
        db_table = "potensi_umkm"
        verbose_name = "Potensi UMKM"
        verbose_name_plural = "Potensi UMKM"

    def __str__(self) -> str:
        return self.nama_usaha


class PotensiWisata(models.Model):
    nama = models.CharField("Nama Wisata/Budaya", max_length=255)
    deskripsi = models.TextField("Deskripsi", blank=True)
    jam_kunjungan = models.CharField("Jam Kunjungan", max_length=255, blank=True)
    harga_tiket = models.CharField("Harga Tiket", max_length=100, blank=True)
    foto = models.ImageField("Foto", upload_to="foto/", null=True, blank=True)
    kontak = models.CharField("Kontak", max_length=100, blank=True)
    geom = models.GeometryField("Geometri", srid=4326)
    created_at = models.DateTimeField("Dibuat Pada", auto_now_add=True)
    updated_at = models.DateTimeField("Diperbarui Pada", auto_now=True)

    class Meta:
        db_table = "potensi_wisata"
        verbose_name = "Potensi Wisata & Budaya"
        verbose_name_plural = "Potensi Wisata & Budaya"

    def __str__(self) -> str:
        return self.nama


class PotensiInfrastruktur(models.Model):
    nama = models.CharField("Nama Fasilitas", max_length=255)
    jenis_fasilitas = models.CharField("Jenis Fasilitas", max_length=255)
    kondisi = models.CharField("Kondisi", max_length=255, blank=True)
    kapasitas = models.CharField("Kapasitas", max_length=255, blank=True)
    pengelola = models.CharField("Pengelola", max_length=255, blank=True)
    geom = models.PointField("Titik Lokasi", srid=4326)
    created_at = models.DateTimeField("Dibuat Pada", auto_now_add=True)
    updated_at = models.DateTimeField("Diperbarui Pada", auto_now=True)

    class Meta:
        db_table = "potensi_infrastruktur"
        verbose_name = "Potensi Infrastruktur"
        verbose_name_plural = "Potensi Infrastruktur"

    def __str__(self) -> str:
        return self.nama


class BatasWilayah(models.Model):
    JENIS_CHOICES = [
        ("desa", "Desa"),
        ("dusun", "Dusun"),
    ]

    nama_wilayah = models.CharField("Nama Wilayah", max_length=255)
    jenis = models.CharField("Jenis Wilayah", max_length=50, choices=JENIS_CHOICES)
    luas_ha = models.DecimalField(
        "Luas (Ha)", max_digits=10, decimal_places=2, null=True, blank=True
    )
    kode_wilayah = models.CharField("Kode Wilayah", max_length=100, blank=True)
    geom = models.MultiPolygonField("Batas Geometri", srid=4326)
    created_at = models.DateTimeField("Dibuat Pada", auto_now_add=True)
    updated_at = models.DateTimeField("Diperbarui Pada", auto_now=True)

    class Meta:
        db_table = "batas_wilayah"
        verbose_name = "Batas Wilayah"
        verbose_name_plural = "Batas Wilayah"

    def __str__(self) -> str:
        return self.nama_wilayah
