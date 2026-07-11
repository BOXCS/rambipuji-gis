import {
  Building2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Store,
  Users,
} from "lucide-react";
import React from "react";
import MiniMap from "../../components/MiniMap";
import StatCard from "../../components/StatCard";
import { getBatasWilayah, getDesaProfile, getStatistik } from "../../lib/api";
import type { DesaProfile, PotensiFeature, StatistikData } from "../../types";

const fallbackProfile: DesaProfile = {
  nama_desa: "Desa Rambipuji",
  kecamatan: "Kecamatan Rambipuji",
  kabupaten: "Kabupaten Jember",
  provinsi: "Jawa Timur",
  jumlah_penduduk: 12450,
  luas_wilayah_ha: 847,
  jumlah_dusun: 7,
  visi: "Terwujudnya Desa Rambipuji yang Mandiri, Sejahtera, dan Berdaya Saing melalui Pemanfaatan Teknologi Informasi dan Pengelolaan Potensi Lokal.",
  misi: [
    "Meningkatkan kualitas pelayanan publik berbasis digital.",
    "Mengoptimalkan potensi pertanian dan perkebunan desa.",
    "Mendorong pertumbuhan UMKM dan ekonomi kreatif warga.",
    "Melestarikan dan mempromosikan destinasi wisata serta budaya lokal.",
    "Membangun infrastruktur desa yang berkelanjutan dan ramah lingkungan.",
  ],
  kontak: {
    alamat: "Jl. Gajah Mada No. 45, Rambipuji, Jember 68152",
    telepon: "(0331) 711234",
    email: "desa@rambipuji.desa.id",
    jam: "Senin - Jumat, 08.00 - 15.00 WIB",
  },
};

const fallbackStatistik: StatistikData = {
  pertanian: 0,
  umkm: 0,
  wisata: 0,
  infrastruktur: 0,
  total: 0,
};

const fallbackBoundaryFeature: PotensiFeature = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [113.57, -8.23],
        [113.61, -8.23],
        [113.61, -8.27],
        [113.57, -8.27],
        [113.57, -8.23],
      ],
    ],
  },
  properties: {
    id: 1,
    nama: "Batas Wilayah Desa Rambipuji",
    kategori: "batas-wilayah",
  },
};

export default async function TentangPage() {
  let profile: DesaProfile = fallbackProfile;
  try {
    const fetched = await getDesaProfile();
    if (fetched && fetched.nama_desa) {
      profile = fetched;
    }
  } catch {
    // use fallbackProfile
  }

  let stats: StatistikData = fallbackStatistik;
  try {
    const fetchedStats = await getStatistik();
    if (fetchedStats) {
      stats = fetchedStats;
    }
  } catch {
    // use fallbackStatistik
  }

  let boundaryFeature: PotensiFeature = fallbackBoundaryFeature;
  try {
    const batasCol = await getBatasWilayah();
    if (batasCol && batasCol.features && batasCol.features.length > 0) {
      boundaryFeature = batasCol.features[0];
    }
  } catch {
    // use fallbackBoundaryFeature
  }

  return (
    <div className="min-h-screen bg-[--bg-surface] flex flex-col pt-16">
      {/* VillageHero */}
      <div className="w-full h-64 bg-gradient-to-r from-[--color-primary] to-[#144A31] relative flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto text-white space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {profile.nama_desa}
          </h1>
          <p className="text-base md:text-lg opacity-90">
            {profile.kecamatan}, {profile.kabupaten}, {profile.provinsi}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10 flex-grow w-full">
        {/* StatCard Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            value={`${(profile.jumlah_penduduk ?? 0).toLocaleString("id-ID")} Jiwa`}
            label="Jumlah Penduduk"
          />
          <StatCard
            icon={Ruler}
            value={`${profile.luas_wilayah_ha ?? 0} Ha`}
            label="Luas Wilayah"
          />
          <StatCard
            icon={Building2}
            value={profile.jumlah_dusun ?? 0}
            label="Jumlah Dusun"
          />
          <StatCard
            icon={Store}
            value={stats.umkm}
            label="UMKM & Usaha Warga"
          />
        </div>

        {/* Two-column About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl border border-[--border-default] space-y-4">
            <h2 className="text-xl font-bold text-[--text-primary]">
              Profil Singkat & Administrasi
            </h2>
            <p className="text-sm text-[--text-secondary] leading-relaxed">
              Desa Rambipuji terletak secara strategis di jantung Kecamatan
              Rambipuji, Kabupaten Jember. Kawasan ini merupakan sentra
              aktivitas agraris, usaha ekonomi mikro, serta cagar budaya lokal.
              Sistem Informasi Geografis (WebGIS) ini dihadirkan untuk
              mendokumentasikan, memetakan, dan menyajikan potensi desa secara
              spasial, transparan, dan mudah diakses oleh seluruh warga dan
              masyarakat luas.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-[--text-primary] px-1">
              Peta Batas Wilayah Administrasi
            </div>
            <MiniMap feature={boundaryFeature} />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[--border-default] space-y-3">
            <h3 className="text-lg font-bold text-[--text-primary]">
              Visi Desa
            </h3>
            <p className="text-sm italic text-[--text-secondary] leading-relaxed">
              &ldquo;{profile.visi}&rdquo;
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[--border-default] space-y-3">
            <h3 className="text-lg font-bold text-[--text-primary]">
              Misi Desa
            </h3>
            <ol className="list-decimal list-inside text-sm text-[--text-secondary] space-y-2">
              {profile.misi.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-6 rounded-xl border border-[--border-default] space-y-4">
          <h3 className="text-lg font-bold text-[--text-primary]">
            Kontak & Pelayanan Kantor Desa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[--color-primary] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[--text-primary]">
                  Alamat Kantor
                </div>
                <div className="text-[--text-secondary]">
                  {profile.kontak.alamat}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-[--color-primary] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[--text-primary]">
                  Telepon
                </div>
                <div className="text-[--text-secondary]">
                  {profile.kontak.telepon}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-[--color-primary] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[--text-primary]">Email</div>
                <div className="text-[--text-secondary]">
                  {profile.kontak.email}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-[--color-primary] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[--text-primary]">
                  Jam Pelayanan
                </div>
                <div className="text-[--text-secondary]">
                  {profile.kontak.jam}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-[--border-default] bg-white text-center">
        <p className="text-sm font-medium text-[--text-primary]">
          WebGIS Potensi Desa Rambipuji © 2025
        </p>
        <p className="text-xs text-[--text-muted] mt-1">
          Dibangun dengan Next.js · GeoServer · PostGIS
        </p>
      </footer>
    </div>
  );
}
