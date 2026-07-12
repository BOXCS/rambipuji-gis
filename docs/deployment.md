# Panduan Deployment Produksi WebGIS Desa Rambipuji

Dokumen ini memuat langkah-langkah lengkah (Checklist Deployment) untuk memasang dan menjalankan aplikasi WebGIS Potensi Desa Rambipuji pada lingkungan peladen produksi (VPS) menggunakan Docker Compose.

---

## Konteks Infrastruktur Server

Server menggunakan **CyberPanel + OpenLiteSpeed** sebagai shared hosting VPS:

- OpenLiteSpeed menguasai port **80** dan **443** di host untuk semua virtual host domain.
- Docker container project **TIDAK BISA** bind port 80 langsung — container Nginx di-expose ke port **8890**, lalu domain publik diarahkan via **reverse proxy OpenLiteSpeed** ke `127.0.0.1:8890`.
- Domain produksi: `rambipuji.research-ai.my.id`

---

## Prasyarat Lingkungan (Server Requirements)

- Peladen Linux VPS (Ubuntu 22.04 LTS / Debian 12 disarankan)
- RAM minimal 4 GB (GeoServer dan PostGIS membutuhkan alokasi memori yang memadai)
- Docker Engine & Docker Compose v2 terpasang
- OpenLiteSpeed virtual host sudah dikonfigurasi untuk forward `rambipuji.research-ai.my.id` → `127.0.0.1:8890`

---

## Langkah-Langkah Deployment (Checklist)

### 1. Salin Proyek ke Peladen VPS

Unggah atau klon kode sumber proyek ke direktori peladen, contoh:

```bash
git clone <url-repo> /opt/rambipuji-gis
cd /opt/rambipuji-gis
```

---

### 2. Konfigurasi Variabel Lingkungan (`.env`)

Salin templat `.env.example` menjadi `.env` dan lengkapi seluruh kredensial produksi:

```bash
cp .env.example .env
nano .env
```

Pastikan variabel penting berikut telah diatur dengan sandi yang kuat:

| Variabel | Keterangan |
|---|---|
| `POSTGRES_PASSWORD` | Sandi database PostgreSQL |
| `GEOSERVER_ADMIN_PASSWORD` | Sandi admin GeoServer |
| `DJANGO_SECRET_KEY` | Secret key Django (min 50 karakter acak) |
| `DJANGO_SUPERUSER_USERNAME` | Username superadmin Django |
| `DJANGO_SUPERUSER_PASSWORD` | Sandi superadmin Django |
| `DJANGO_SUPERUSER_EMAIL` | Email superadmin Django |
| `NEXT_PUBLIC_API_URL` | URL publik API, misal `https://rambipuji.research-ai.my.id/api` |
| `NEXT_PUBLIC_GEOSERVER_URL` | URL publik GeoServer, misal `https://rambipuji.research-ai.my.id/geoserver` |
| `INTERNAL_API_URL` | URL internal Docker, **selalu** `http://backend:8000/api` |
| `PUBLIC_BASE_URL` | URL domain publik, misal `https://rambipuji.research-ai.my.id` |

---

### 3. Bersihkan Container Lama (Jika Rebuild dari Nol)

> [!IMPORTANT]
> Semua service memiliki `container_name` yang di-hardcode (misal `rambipuji_frontend`). Jika ada sisa container lama dengan nama yang sama, Docker akan error `"container name already in use"`. **Selalu jalankan perintah ini sebelum rebuild ulang dari nol:**

```bash
docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml down
```

Jangan gunakan `docker rm -f` manual karena tidak membersihkan named volumes secara konsisten dengan project name.

---

### 4. Build dan Jalankan Container dalam Mode Produksi

```bash
docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

> [!WARNING]
> **NEXT_PUBLIC_\* di-bake ke JS bundle saat BUILD TIME, bukan runtime.**
>
> Setiap kali nilai `NEXT_PUBLIC_API_URL` atau `NEXT_PUBLIC_GEOSERVER_URL` di `.env` berubah, frontend **wajib di-rebuild ulang dengan `--no-cache`** — hanya restart container tidak cukup:
>
> ```bash
> # Rebuild frontend setelah .env NEXT_PUBLIC_* berubah:
> docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
> docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate frontend
> ```

---

### 5. Jalankan Migrasi Basis Data Django

Setelah seluruh layanan aktif dan sehat (`healthy`), jalankan migrasi PostGIS:

```bash
docker compose -p rambipuji exec backend python manage.py migrate
```

---

### 6. Buat Akun Superadmin Django (Pertama Kali)

Buat akun superadmin secara otomatis menggunakan kredensial pada berkas `.env`. Lewati langkah ini jika superadmin sudah ada sebelumnya.

```bash
docker compose -p rambipuji exec backend python manage.py createsuperuser --noinput
```

---

### 7. Publikasi Lapisan Spasial ke GeoServer

Jalankan skrip inisialisasi otomatis untuk membuat workspace `rambipuji`, datastore PostGIS, mendaftarkan SLD, dan mempublikasikan 5 featuretype:

```bash
docker compose -p rambipuji exec backend python /geoserver/scripts/setup_geoserver.py
```

---

### 8. Verifikasi Layanan WMS & WFS GeoServer

Pastikan seluruh 5 lapisan berhasil dipublikasikan dan merespons GetCapabilities maupun GetMap:

```bash
docker compose -p rambipuji exec backend python /geoserver/scripts/verify_layers.py
```

---

### 9. Jalankan Smoke Test End-to-End

Verifikasi semua endpoint kritis (API publik, GeoServer WMS, auth login, admin CRUD, frontend root) berjalan normal di domain produksi:

```bash
# Dari host VPS:
python scripts/smoke_test.py https://rambipuji.research-ai.my.id

# Atau dari dalam container backend (scripts/ ter-mount di /app/scripts):
docker compose -p rambipuji exec backend python /app/scripts/smoke_test.py http://nginx:80
```

Target: **10/10 PASS**.

---

### 10. Akses Situs Web di Browser

Buka antarmuka WebGIS melalui browser:

```
https://rambipuji.research-ai.my.id/
```

---

### 11. Uji Regresi Backend (`pytest`)

Pastikan tidak ada regresi fungsi dengan menjalankan unit test:

```bash
docker compose -p rambipuji exec backend pytest --tb=short -q
```

Target: **86/86 PASS**.

---

### 12. Pelatihan Staf Admin Desa

Lakukan pengujian penerimaan pengguna (UAT) dan berikan panduan penggunaan (`docs/panduan-admin.md`) kepada perangkat desa yang bertugas mengelola data.

---

## Catatan Port & Reverse Proxy

| Service | Port Container | Port Host (dev) | Port Host (prod) |
|---|---|---|---|
| nginx | 80 | 8888 | 8890 |
| frontend | 3000 | 3000 | *(tidak di-expose)* |
| backend | 8000 | 8000 | *(tidak di-expose)* |
| geoserver | 8080 | 8085 | *(tidak di-expose)* |
| postgres | 5432 | 5434 | *(tidak di-expose)* |

Di produksi, **hanya nginx yang di-expose** ke host (port 8890). Semua service lain berkomunikasi internal antar container via Docker network.

---

## Catatan Tambahan (HTTPS & SSL)

Untuk produksi publik, SSL/HTTPS dikelola oleh **OpenLiteSpeed** (CyberPanel) di level reverse proxy — bukan oleh container Nginx. Container Nginx hanya perlu serve HTTP ke `127.0.0.1:8890`. Port 443 di `docker-compose.prod.yml` sengaja dikomentari.

---

## Perintah Berguna

```bash
# Cek status semua container
docker compose -p rambipuji ps

# Lihat log service tertentu (misal frontend)
docker compose -p rambipuji logs -f frontend

# Masuk ke shell container backend
docker compose -p rambipuji exec backend bash

# Stop semua container tanpa hapus volume
docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml stop

# Stop dan hapus container + network (TANPA hapus named volumes/data)
docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml down

# Stop dan hapus SEMUA termasuk volumes (⚠️ DATA HILANG)
docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml down -v
```

---

## Otomatisasi Deployment (CI/CD Production)

Proyek ini dilengkapi dengan skrip otomatisasi deployment ([`scripts/deploy-prod.sh`](file:///d:/zaky/Project/GIS%20Rambipuji/rambipuji-gis/scripts/deploy-prod.sh)) dan alur kerja GitHub Actions ([`.github/workflows/deploy-prod.yml`](file:///d:/zaky/Project/GIS%20Rambipuji/rambipuji-gis/.github/workflows/deploy-prod.yml)) agar setiap perubahan di branch `main` langsung di-deploy otomatis ke VPS tanpa intervensi manual.

### Cara 1: Otomatisasi via GitHub Actions (CD Pipeline)

1. Di repositori GitHub Anda (`https://github.com/BOXCS/rambipuji-gis`), masuk ke **Settings → Secrets and variables → Actions**.
2. Klik **New repository secret** dan tambahkan variabel rahasia berikut:
   - **`VPS_HOST`**: Alamat IP atau domain server VPS (misal: `rambipuji.research-ai.my.id`).
   - **`VPS_USER`**: Username SSH di VPS (misal: `rambi8357` atau `root`).
   - **`VPS_SSH_KEY`**: Private key SSH (`~/.ssh/id_rsa` atau ED25519) dari komputer yang punya akses ke VPS.
   - **`VPS_PORT`**: Port SSH (opsional, default `22`).
3. Setiap kali Anda melakukan `git push origin main` atau me-merge Pull Request ke branch `main`, GitHub Actions akan terpicu otomatis melewati 3 tahap:
   - **`test-frontend`**: Memverifikasi pemeriksaan tipe TypeScript (`npx tsc --noEmit`) dan mencoba build produksi Next.js (`npm run build`).
   - **`test-backend`**: Menjalankan container PostGIS sementara, menginstal GDAL/GeoDjango, melakukan pemeriksaan sistem Django (`manage.py check`), dan menjalankan seluruh unit test (`pytest`).
   - **`deploy`**: **Hanya jika kedua tes di atas sukses 100%**, runner GitHub Actions masuk ke VPS via SSH dan mengeksekusi [`scripts/deploy-prod.sh`](file:///d:/zaky/Project/GIS%20Rambipuji/rambipuji-gis/scripts/deploy-prod.sh). Bila ada error pada kode, proses deploy dibatalkan otomatis sehingga server produksi selalu aman dari kode yang rusak.

### Cara 2: Satu Perintah Deployment di VPS ( Tanpa GitHub Actions )

Jika ingin memperbarui produksi secara cepat dari terminal VPS tanpa mengetik banyak perintah manual:

```bash
cd ~/public_html
bash scripts/deploy-prod.sh
```
