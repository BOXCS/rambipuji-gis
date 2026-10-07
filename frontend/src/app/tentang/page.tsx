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
import Image from "next/image";
import React from "react";
import HeroCarousel, { HeroCarouselImage } from "../../components/HeroCarousel";
import JsonLd from "../../components/JsonLd";
import MiniMap from "../../components/MiniMap";
import StatCard from "../../components/StatCard";
import { getBatasWilayah, getDesaProfile, getPotensiAll, getStatistik } from "../../lib/api";
import type { DesaProfile, PotensiCollection, PotensiFeature, StatistikData } from "../../types";

function FormattedText({
  text,
  fallback,
}: {
  text?: string;
  fallback: React.ReactNode;
}) {
  if (!text || text.trim() === "") {
    return <>{fallback}</>;
  }

  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="space-y-2 my-2 pl-1">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[--color-primary-subtle] text-[--color-primary] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                •
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^[-•*]\s*/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-•*]\s*/, "");
      if (itemText) currentListItems.push(itemText);
    } else {
      flushList();
      if (trimmed !== "") {
        blocks.push(
          <p key={`p-${i}`} className="leading-relaxed mb-3 last:mb-0">
            {trimmed}
          </p>
        );
      }
    }
  });

  flushList();

  return <div>{blocks}</div>;
}

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

  let potensiData: PotensiCollection | null = null;
  try {
    potensiData = await getPotensiAll();
  } catch {
    // ignore
  }

  // Find Balai Desa Rambipuji location point from infrastructure tag
  let balaiDesaFeature: PotensiFeature | null = null;
  if (potensiData && potensiData.features) {
    balaiDesaFeature =
      potensiData.features.find((f) => {
        const name = (f.properties.nama || f.properties.nama_usaha || "").toLowerCase();
        const cat = f.properties.kategori;
        return (
          cat === "infrastruktur" &&
          (name.includes("balai desa") || name.includes("kantor desa") || name.includes("balai") || name.includes("kantor"))
        );
      }) ||
      potensiData.features.find((f) => f.properties.kategori === "infrastruktur") ||
      null;
  }

  // Build hero carousel images from profile hero photo + all potensi photos in Rambipuji
  const heroImages: HeroCarouselImage[] = [];

  if (profile.foto_hero_url) {
    heroImages.push({
      url: profile.foto_hero_url,
      title: `Profil ${profile.nama_desa}`,
    });
  }

  if (potensiData && potensiData.features) {
    potensiData.features.forEach((feat) => {
      const p = feat.properties;
      const title = p.nama || p.nama_usaha || "Potensi Desa";
      const cat = p.kategori || "";

      if (p.foto_list_urls && p.foto_list_urls.length > 0) {
        p.foto_list_urls.forEach((u: string) => {
          if (u && !heroImages.some((i) => i.url === u)) {
            heroImages.push({ url: u, title, category: cat });
          }
        });
      } else if (p.foto && typeof p.foto === "string") {
        if (!heroImages.some((i) => i.url === p.foto)) {
          heroImages.push({ url: p.foto, title, category: cat });
        }
      }
    });
  }

  if (heroImages.length === 0) {
    heroImages.push({
      url: "/logo-kabupaten-jember.png",
      title: "Desa Rambipuji",
    });
  }

  // Resolve misi items safely
  const resolvedMisi: string[] = [];
  if (Array.isArray(profile.misi)) {
    profile.misi.forEach((item) => {
      if (typeof item === "string" && item.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) {
            resolvedMisi.push(...parsed.map(String));
            return;
          }
        } catch {
          // ignore parse error
        }
      }
      resolvedMisi.push(String(item));
    });
  } else if (typeof profile.misi === "string") {
    try {
      const parsed = JSON.parse(profile.misi);
      if (Array.isArray(parsed)) {
        resolvedMisi.push(...parsed.map(String));
      } else {
        resolvedMisi.push(profile.misi);
      }
    } catch {
      resolvedMisi.push(profile.misi);
    }
  }

  // Resolve contact fields — support both new flat fields and legacy kontak object
  const resolvedContact = {
    alamat: profile.alamat_kantor ?? profile.kontak?.alamat ?? "",
    telepon: profile.telepon ?? profile.kontak?.telepon ?? "",
    email: profile.email ?? profile.kontak?.email ?? "",
    jam: profile.jam_pelayanan ?? profile.kontak?.jam ?? "",
  };

  const contactItems = [
    {
      icon: MapPin,
      label: "Alamat Kantor",
      value: resolvedContact.alamat,
    },
    {
      icon: Phone,
      label: "Telepon",
      value: resolvedContact.telepon,
    },
    {
      icon: Mail,
      label: "Email",
      value: resolvedContact.email,
    },
    {
      icon: Clock,
      label: "Jam Pelayanan",
      value: resolvedContact.jam,
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

      {/* Hero section — Auto-playing Background Photo Carousel featuring all Potensi in Rambipuji */}
      <HeroCarousel images={heroImages}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            {/* Location label pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm mb-4 backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
            >
              <MapPin className="h-3.5 w-3.5" />
              Kec. Rambipuji, Kab. Jember, Jawa Timur
            </div>

            <h1 className="text-4xl font-semibold mb-3 tracking-tight">{profile.nama_desa}</h1>
            <div className="text-white/90 text-lg max-w-2xl">
              <FormattedText
                text={profile.deskripsi}
                fallback={
                  <p>
                    Selamat datang di portal informasi resmi {profile.nama_desa}. Temukan potensi, layanan, dan informasi desa kami di sini.
                  </p>
                }
              />
            </div>
          </div>
          <Image
            src="/logo-kabupaten-jember.png"
            alt="Logo Kabupaten Jember"
            width={96}
            height={96}
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20"
          />
        </div>
      </HeroCarousel>

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
            label="UMKM &amp; Usaha Warga"
          />
        </div>
      </div>

      {/* About section — 2 columns */}
      <div className="max-w-7xl mx-auto px-4 mb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: text with formatted paragraphs & bullet lists */}
          <div>
            <p className="text-[--color-primary] text-sm font-semibold tracking-wider uppercase mb-3">
              Tentang Desa
            </p>
            <h2 className="text-2xl font-semibold text-[--text-primary] mb-4">
              Profil Singkat &amp; Administrasi
            </h2>
            <div className="text-[--text-secondary] leading-relaxed text-base">
              <FormattedText
                text={profile.sejarah}
                fallback={
                  <>
                    <p className="mb-3">
                      Desa Rambipuji merupakan desa di Kecamatan Rambipuji, Kabupaten Jember, Jawa Timur,
                      yang memiliki potensi lokal berbasis wisata, sejarah, budaya, dan ekonomi kreatif
                      masyarakat. Desa ini memiliki potensi wisata seperti Gumuk Gong dan Gumuk Dempet,
                    </p>
                    <p>
                      serta aktivitas ekonomi masyarakat seperti usaha tempe yang berkembang secara turun-temurun.
                      Potensi tersebut menjadi dasar pengembangan desa berbasis pariwisata, industri kreatif,
                      dan promosi digital.
                    </p>
                  </>
                }
              />
            </div>
          </div>

          {/* Right: Foto Hero unggulan + mini map + address */}
          <div className="space-y-4">
            {profile.foto_hero_url && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-[--border-default] group">
                <Image
                  src={profile.foto_hero_url}
                  alt={`Dokumentasi ${profile.nama_desa}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-medium text-white/90 drop-shadow">
                    Dokumentasi Resmi {profile.nama_desa}
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden shadow-md h-64">
              <MiniMap feature={balaiDesaFeature} boundaryFeature={boundaryFeature} />
            </div>
            <div className="bg-[--bg-surface-raised] rounded-xl p-4 flex items-start gap-3 border border-[--border-default]">
              <MapPin className="h-4 w-4 text-[--color-primary] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[--text-secondary]">
                {resolvedContact.alamat}
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
                {resolvedMisi.map((item, idx) => (
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

      {/* Pihak Yang Berkontribusi Section */}
      <div className="bg-white border-t border-[--border-default] py-12 w-full">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-[--text-primary] mb-2">
            Pihak Yang Berkontribusi
          </h2>
          <p className="text-sm text-[--text-secondary] max-w-xl mx-auto mb-8">
            Pengembangan WebGIS dan Sistem Informasi Desa Rambipuji didukung oleh kolaborasi dan pendanaan PNBP.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {/* Logo Polije */}
            <div className="flex flex-col items-center gap-3 bg-[--bg-surface-raised] p-6 rounded-2xl border border-[--border-default] hover:shadow-md transition w-64">
              <div className="h-20 flex items-center justify-center">
                <Image
                  src="/logo Polije.png"
                  alt="Politeknik Negeri Jember"
                  width={80}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <div className="text-center">
                <span className="block font-semibold text-sm text-[--text-primary]">
                  Politeknik Negeri Jember
                </span>
                <span className="block text-xs text-[--text-muted] mt-0.5">
                  Pendanaan PNBP Polije 2026
                </span>
              </div>
            </div>

            {/* Logo Pemkab Jember / Desa Rambipuji */}
            <div className="flex flex-col items-center gap-3 bg-[--bg-surface-raised] p-6 rounded-2xl border border-[--border-default] hover:shadow-md transition w-64">
              <div className="h-20 flex items-center justify-center">
                <Image
                  src="/logo-kabupaten-jember.png"
                  alt="Pemerintah Desa Rambipuji"
                  width={80}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <div className="text-center">
                <span className="block font-semibold text-sm text-[--text-primary]">
                  Pemerintah Desa Rambipuji
                </span>
                <span className="block text-xs text-[--text-muted] mt-0.5">
                  Kec. Rambipuji, Kab. Jember
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
