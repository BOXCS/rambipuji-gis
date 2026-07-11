"""
Village profile data for Desa Rambipuji.

This module holds the static profile dict served by the /api/public/desa/ endpoint.
It is intentionally kept as a plain Python data structure — no database queries,
no business logic. When profile editing is implemented in a future phase, this
dict will be replaced by a database model and this file will be removed.

Source: architecture.md § Storage Model, project-overview.md § Village Profile Page.
"""

from __future__ import annotations

DESA_PROFILE: dict = {
    "nama_desa": "Rambipuji",
    "kecamatan": "Rambipuji",
    "kabupaten": "Jember",
    "provinsi": "Jawa Timur",
    "jumlah_penduduk": None,          # To be filled by village staff
    "luas_wilayah_ha": None,          # To be filled by village staff
    "jumlah_dusun": None,             # To be filled by village staff
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
    "kontak": {
        "alamat": "Jl. Rambipuji No. 1, Desa Rambipuji, Kecamatan Rambipuji, Jember 68152",
        "telepon": None,              # To be filled by village staff
        "email": None,                # To be filled by village staff
        "jam": "Senin – Jumat, 08.00 – 15.00 WIB",
    },
}
