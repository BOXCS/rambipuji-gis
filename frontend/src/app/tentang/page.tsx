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
import type { Metadata } from "next";
import React from "react";
import JsonLd from "../../components/JsonLd";
import MiniMap from "../../components/MiniMap";
import StatCard from "../../components/StatCard";
import { getBatasWilayah, getDesaProfile, getStatistik } from "../../lib/api";
import type { DesaProfile, PotensiFeature, StatistikData } from "../../types";

// Always fetch fresh data — do not serve a cached HTML render of this page.
// Without this, Next.js would cache the statistik counts from the first render
// and admin-added data would not appear until a full re-deploy.
export const revalidate = 0;

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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await getDesaProfile()
    return {
      title: "Tentang Desa",
      description:
        `${profile.nama_desa}, ${profile.kecamatan}, ` +
        `${profile.kabupaten}. Jumlah penduduk ` +
        `${profile.jumlah_penduduk.toLocaleString("id-ID")} jiwa, ` +
        `luas wilayah ${profile.luas_wilayah_ha} Ha. ` +
        `${profile.visi}`,
      alternates: { canonical: "/tentang" },
      openGraph: {
        title: `${profile.nama_desa} — Profil Desa`,
        description: profile.visi,
        url: "/tentang",
      },
    }
  } catch {
    return {
      title: "Tentang Desa Rambipuji",
      description: "Profil Desa Rambipuji, Jember.",
      alternates: { canonical: "/tentang" },
    }
  }
}

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

  const contactItems = [
    {
      icon: MapPin,
      label: "Alamat Kantor",
      value: profile.kontak.alamat,
    },
    {
      icon: Phone,
      label: "Telepon",
      value: profile.kontak.telepon,
    },
    {
      icon: Mail,
      label: "Email",
      value: profile.kontak.email,
    },
    {
      icon: Clock,
      label: "Jam Pelayanan",
      value: profile.kontak.jam,
    },
  ];

  return (
    <div className="min-h-screen bg-[--bg-base] flex flex-col pt-16">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "City",
        "name": profile.nama_desa,
        "description": profile.visi,
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": profile.kabupaten
        },
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/tentang`
      }} />
      {/* Hero section — layered gradient with decorative blobs */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, var(--color-primary), #0f3d28)",
        }}
      >
        {/* Decorative circle blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            transform: "translate(50%, -50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            transform: "translate(-50%, 50%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          {/* Location label pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm mb-4"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
          >
            <MapPin className="h-3.5 w-3.5" />
            Kec. Rambipuji, Kab. Jember, Jawa Timur
          </div>

          <h1 className="text-4xl font-semibold mb-3">{profile.nama_desa}</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Selamat datang di portal informasi resmi {profile.nama_desa}.
            Temukan potensi, layanan, dan informasi desa kami di sini.
          </p>
        </div>
      </section>

      {/* StatCards — elevated above hero with negative margin */}
      <div className="max-w-7xl mx-auto px-4 w-full -mt-6 mb-10 relative z-10">
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
      </div>

      {/* About section — 2 columns */}
      <div className="max-w-7xl mx-auto px-4 mb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: text */}
          <div>
            <p className="text-[--color-primary] text-sm font-semibold tracking-wider uppercase mb-3">
              Tentang Desa
            </p>
            <h2 className="text-2xl font-semibold text-[--text-primary] mb-4">
              Profil Singkat &amp; Administrasi
            </h2>
            <div className="text-[--text-secondary] leading-relaxed text-base space-y-3">
              <p>
                Desa Rambipuji merupakan desa di Kecamatan Rambipuji, Kabupaten Jember, Jawa Timur,
                yang memiliki potensi lokal berbasis wisata, sejarah, budaya, dan ekonomi kreatif
                masyarakat. Desa ini memiliki potensi wisata seperti Gumuk Gong dan Gumuk Dempet,
              </p>
              <p>
                serta aktivitas ekonomi masyarakat seperti usaha tempe yang berkembang secara turun-temurun
                Potensi tersebut menjadi dasar pengembangan
                desa berbasis pariwisata, industri kreatif, dan promosi digital.Versi Narasi Beranda
              </p>
            </div>
          </div>

          {/* Right: mini map + address */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-md h-64">
              <MiniMap feature={boundaryFeature} />
            </div>
            <div className="bg-[--bg-surface-raised] rounded-xl p-4 flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[--color-primary] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[--text-secondary]">
                {profile.kontak.alamat}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="bg-[--bg-surface-raised] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center text-[--text-primary] mb-8">
            Visi &amp; Misi
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visi */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{
                background:
                  "linear-gradient(to bottom right, var(--color-primary), #145235)",
              }}
            >
              <p className="tracking-widest text-xs text-white/60 mb-3 font-semibold uppercase">
                VISI
              </p>
              <p
                className="text-6xl leading-none mb-2 font-serif"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                &ldquo;
              </p>
              <p className="text-lg font-medium italic leading-relaxed">
                {profile.visi}
              </p>
            </div>

            {/* Misi */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[--border-default]">
              <p className="tracking-widest text-xs text-[--text-muted] mb-4 font-semibold uppercase">
                MISI
              </p>
              <ol className="space-y-0">
                {profile.misi.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 items-start py-2 border-b border-[--border-default] last:border-0"
                  >
                    <span className="w-6 h-6 rounded-full bg-[--color-primary-subtle] text-[--color-primary] text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-[--text-secondary] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-semibold text-[--text-primary] mb-6">
          Hubungi Kami
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 border border-[--border-default] shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[--color-primary-subtle] flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-[--color-primary]" />
              </div>
              <p className="text-xs text-[--text-muted] font-medium tracking-wide uppercase mb-1">
                {label}
              </p>
              <p className="text-sm text-[--text-primary] font-medium">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-8 mt-auto"
        style={{ background: "var(--text-primary)", color: "white" }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[--color-primary]" />
            <span className="font-semibold">WebGIS Desa Rambipuji</span>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            &copy; 2025 Desa Rambipuji, Kec. Rambipuji, Kab. Jember, Jawa
            Timur
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Dibangun dengan Next.js &middot; GeoServer &middot; PostGIS
          </p>
        </div>
      </footer>
    </div>
  );
}
