"""
Management command: seed_desa_profile

Seeds the DesaProfile singleton from the static desa_profile.py dict.

Usage:
    docker compose exec backend python manage.py seed_desa_profile

Run this once after the initial migration to populate the DB row
from the existing hardcoded data. Subsequent admin edits via the
API will update the row directly — re-running this command will
overwrite those edits, so only run it during initial setup.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand

from apps.potensi.data.desa_profile import DESA_PROFILE
from apps.potensi.models import DesaProfile


class Command(BaseCommand):
    help = "Seed DesaProfile singleton from apps/potensi/data/desa_profile.py"

    def handle(self, *args: object, **kwargs: object) -> None:
        profile = DesaProfile.get_instance()
        d = DESA_PROFILE

        profile.nama_desa = d.get("nama_desa", "")
        profile.kecamatan = d.get("kecamatan", "")
        profile.kabupaten = d.get("kabupaten", "")
        profile.provinsi = d.get("provinsi", "")

        # Numeric stats — fall back to 0 when None (placeholder values)
        profile.jumlah_penduduk = d.get("jumlah_penduduk") or 0
        profile.luas_wilayah_ha = d.get("luas_wilayah_ha") or 0
        profile.jumlah_dusun = d.get("jumlah_dusun") or 0

        profile.visi = d.get("visi", "")
        profile.misi = d.get("misi", [])

        # Contact fields live inside nested dict in the static file
        kontak: dict = d.get("kontak", {})
        profile.alamat_kantor = kontak.get("alamat", "") or ""
        profile.telepon = kontak.get("telepon", "") or ""
        profile.email = kontak.get("email", "") or ""
        profile.jam_pelayanan = kontak.get("jam", "") or ""

        profile.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"DesaProfile seeded: '{profile.nama_desa}' (pk={profile.pk})"
            )
        )
