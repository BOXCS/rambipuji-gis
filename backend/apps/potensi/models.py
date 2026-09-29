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
    foto_list = models.JSONField("Daftar Foto", default=list, blank=True)
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
    foto_list = models.JSONField("Daftar Foto", default=list, blank=True)
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
    foto_list = models.JSONField("Daftar Foto", default=list, blank=True)
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
    kontak = models.CharField("Kontak", max_length=100, blank=True)
    foto = models.ImageField("Foto", upload_to="foto/", null=True, blank=True)
    foto_list = models.JSONField("Daftar Foto", default=list, blank=True)
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


class DesaProfile(models.Model):
    """Singleton model — only one instance (pk=1) is ever created.

    Use ``DesaProfile.get_instance()`` to retrieve or lazily create it.
    Village staff edit all fields via the admin panel; the public API
    serves the latest values from this table.
    """

    # ── Identity ─────────────────────────────────────────────────────────────
    nama_desa = models.CharField("Nama Desa", max_length=255)
    kecamatan = models.CharField("Kecamatan", max_length=255)
    kabupaten = models.CharField("Kabupaten", max_length=255)
    provinsi = models.CharField("Provinsi", max_length=255)
    kode_pos = models.CharField("Kode Pos", max_length=10, blank=True, default="")

    # ── Demographics ─────────────────────────────────────────────────────────
    jumlah_penduduk = models.PositiveIntegerField("Jumlah Penduduk", default=0)
    jumlah_penduduk_laki = models.PositiveIntegerField(
        "Penduduk Laki-laki", default=0
    )
    jumlah_penduduk_perempuan = models.PositiveIntegerField(
        "Penduduk Perempuan", default=0
    )
    jumlah_kk = models.PositiveIntegerField("Jumlah KK", default=0)
    luas_wilayah_ha = models.DecimalField(
        "Luas Wilayah (Ha)", max_digits=10, decimal_places=2, default=0
    )
    jumlah_dusun = models.PositiveSmallIntegerField("Jumlah Dusun", default=0)
    jumlah_rw = models.PositiveSmallIntegerField("Jumlah RW", default=0)
    jumlah_rt = models.PositiveSmallIntegerField("Jumlah RT", default=0)

    # ── Vision & Mission ─────────────────────────────────────────────────────
    visi = models.TextField("Visi", blank=True, default="")
    misi = models.JSONField("Misi", default=list, blank=True)  # list[str]

    # ── History & Description ────────────────────────────────────────────────
    sejarah = models.TextField("Sejarah Desa", blank=True, default="")
    deskripsi = models.TextField("Deskripsi Singkat", blank=True, default="")

    # ── Contact ──────────────────────────────────────────────────────────────
    alamat_kantor = models.TextField("Alamat Kantor", blank=True, default="")
    telepon = models.CharField("Telepon", max_length=50, blank=True, default="")
    email = models.EmailField("Email", blank=True, default="")
    website = models.URLField("Website", blank=True, default="")
    jam_pelayanan = models.CharField(
        "Jam Pelayanan", max_length=255, blank=True, default=""
    )

    # ── Hero Image ───────────────────────────────────────────────────────────
    foto_hero = models.ImageField(
        "Foto Hero", upload_to="desa/", null=True, blank=True
    )

    # ── Metadata ─────────────────────────────────────────────────────────────
    updated_at = models.DateTimeField("Diperbarui Pada", auto_now=True)

    class Meta:
        db_table = "desa_profile"
        verbose_name = "Profil Desa"
        verbose_name_plural = "Profil Desa"

    def __str__(self) -> str:
        return self.nama_desa

    @classmethod
    def get_instance(cls) -> "DesaProfile":
        """Always return the single profile row, creating it with safe defaults
        if it does not yet exist (e.g. on a fresh database)."""
        instance, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "nama_desa": "Desa Rambipuji",
                "kecamatan": "Rambipuji",
                "kabupaten": "Jember",
                "provinsi": "Jawa Timur",
                "visi": (
                    "Terwujudnya Desa Rambipuji yang maju, sejahtera, dan berdaya saing "
                    "berbasis potensi lokal dan tata kelola pemerintahan yang baik."
                ),
                "misi": [
                    "Meningkatkan kualitas pelayanan publik dan tata kelola pemerintahan desa.",
                    "Mengembangkan potensi pertanian, UMKM, pariwisata, dan infrastruktur desa.",
                    "Meningkatkan kualitas sumber daya manusia melalui pendidikan dan kesehatan.",
                    "Memperkuat partisipasi masyarakat dalam pembangunan desa.",
                    "Memanfaatkan teknologi untuk transparansi dan akselerasi pembangunan.",
                ],
                "alamat_kantor": (
                    "Jl. Rambipuji No. 1, Desa Rambipuji, Kecamatan Rambipuji, Jember 68152"
                ),
                "jam_pelayanan": "Senin – Jumat, 08.00 – 15.00 WIB",
            },
        )
        return instance
