#!/usr/bin/env bash
# Automated Production Deployment Script for WebGIS Rambipuji
# Usage: ./scripts/deploy-prod.sh

set -euo pipefail

echo "=== [1/4] Sinkronisasi kode terbaru dari branch main ==="
git fetch origin main
git reset --hard origin/main

echo "=== [2/4] Rebuild & Update Docker Container Produksi ==="
# docker compose otomatis mendeteksi perubahan pada service (termasuk ARG build-time frontend)
# dan melakukan rebuild/restart hanya pada container yang relevan.
docker compose -p rambipuji -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

echo "=== [3/4] Menjalankan migrasi basis data Django (jika ada) ==="
docker compose -p rambipuji exec -T backend python manage.py migrate --noinput || true

echo "=== [4/4] Membersihkan cache build & image lama (prune) ==="
docker image prune -f || true

echo "=== Deployment berhasil diselesaikan! ==="
