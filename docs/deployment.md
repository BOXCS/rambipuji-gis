# Panduan Deployment Produksi WebGIS Desa Rambipuji

Dokumen ini memuat langkah-langkah lengkap (Checklist Deployment) untuk memasang dan menjalankan aplikasi WebGIS Potensi Desa Rambipuji pada lingkungan peladen produksi (VPS) menggunakan Docker Compose.

---

## Prasyarat Lingkungan (Server Requirements)
- Peladen Linux VPS (Ubuntu 22.04 LTS / Debian 12 disarankan)
- RAM minimal 4 GB (GeoServer dan PostGIS membutuhkan alokasi memori yang memadai)
- Docker Engine & Docker Compose v2 terpasang

---

## Langkah-Langkah Deployment (Checklist)

### 1. Salin Proyek ke Peladen VPS
Unggah atau klon kode sumber proyek ke direktori peladen, contoh:
```bash
git clone <url-repo> /opt/rambipuji-gis
cd /opt/rambipuji-gis
```

### 2. Konfigurasi Variabel Lingkungan (`.env`)
Salin templat `.env.example` menjadi `.env` dan lengkapi seluruh kredensial produksi:
```bash
cp .env.example .env
nano .env
```
Pastikan variabel penting berikut telah diatur dengan sandi yang kuat:
- `POSTGRES_PASSWORD`
- `GEOSERVER_ADMIN_PASSWORD`
- `DJANGO_SECRET_KEY`
- `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_PASSWORD`, `DJANGO_SUPERUSER_EMAIL`

### 3. Bangun dan Jalankan Container dalam Mode Produksi
Gunakan gabungan `docker-compose.yml` dan konfigurasi penimpa produksi `docker-compose.prod.yml`:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 4. Jalankan Migrasi Basis Data Django
Setelah seluruh layanan aktif dan sehat (`healthy`), jalankan migrasi PostGIS:
```bash
docker compose exec backend python manage.py migrate
```

### 5. Buat Akun Superadmin Django
Buat akun superadmin secara otomatis menggunakan kredensial pada berkas `.env`:
```bash
docker compose exec backend python manage.py createsuperuser --noinput
```

### 6. Publikasi Lapisan Spasial ke GeoServer
Jalankan skrip inisialisasi otomatis untuk membuat workspace `rambipuji`, datastore PostGIS, mendaftarkan SLD, dan mempublikasikan 5 featuretype:
```bash
docker compose exec backend python /geoserver/scripts/setup_geoserver.py
```

### 7. Verifikasi Layanan WMS & WFS GeoServer
Pastikan seluruh 5 lapisan berhasil dipublikasikan dan merespons GetCapabilities maupun GetMap:
```bash
docker compose exec backend python /geoserver/scripts/verify_layers.py
```

### 8. Akses Situs Web di Browser
Buka antarmuka WebGIS melalui browser dengan mengetikkan alamat IP peladen atau domain:
```
http://<server-ip>/
```

### 9. Uji Regresi Backend (`pytest`)
Pastikan tidak ada regresi fungsi pada peladen produksi dengan menjalankan unit test:
```bash
docker compose exec backend pytest --tb=short -q
```

### 10. Pelatihan Staf Admin Desa
Lakukan pengujian penerimaan pengguna (UAT) dan berikan panduan penggunaan (`docs/panduan-admin.md`) kepada perangkat desa yang bertugas mengelola data.

---

## Catatan Tambahan (HTTPS & SSL)
Untuk produksi publik, disarankan mengonfigurasi terminasi SSL (HTTPS) menggunakan Let's Encrypt Certbot pada reverse proxy Nginx di porta 443.
