import {
  ArrowRight,
  Building2,
  Clock,
  Compass,
  Mail,
  Map,
  MapPin,
  Phone,
  Ruler,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    <div className="min-h-screen bg-[--bg-base] flex flex-col">
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

      {/* ── 1. Hero Section — Fullscreen Immersive Tourism Showcase ────────── */}
      <HeroCarousel
        images={heroImages}
        fullScreen={true}
        showScrollPrompt={true}
        overlayGradient="linear-gradient(180deg, rgba(6, 26, 16, 0.45) 0%, rgba(6, 26, 16, 0.70) 55%, rgba(4, 18, 11, 0.96) 100%)"
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase glass-pill text-white/95 shadow-lg mb-6">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>KECAMATAN RAMBIPUJI · KABUPATEN JEMBER · JAWA TIMUR</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 text-shadow-hero">
            Rambipuji: Warisan Lokal di Tengah Dinamika Perkotaan
          </h1>

          <div className="text-base sm:text-lg md:text-xl text-white/85 max-w-3xl mx-auto font-sans leading-relaxed mb-8 text-shadow-subtle space-y-4">
            <p>
              Desa Rambipuji merupakan kawasan berkarakter perkotaan di sebelah barat Kota Jember yang berkembang melalui aktivitas perdagangan, jasa, permukiman, dan kehidupan sosial masyarakat. Di tengah perkembangan tersebut, Rambipuji tetap menyimpan kekayaan sejarah, budaya, dan potensi ekonomi lokal yang menjadi bagian dari identitas wilayahnya.
            </p>
            <p className="text-white/80 text-sm sm:text-base">
              Lanskap Gumuk Gong dan Gumuk Dempet, wisata religi Makam Mbah Puji dan Mbah Plecutan, Taman Edukasi Kampung Dinoyo, serta sentra produksi tempe yang berkembang secara turun-temurun mencerminkan keberagaman potensi desa. Perpaduan warisan lokal dan dinamika perkotaan inilah yang menjadikan Rambipuji memiliki karakter serta daya tarik tersendiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#sejarah"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Telusuri Sejarah &amp; Rekam Jejak &rarr;
            </a>
            <Link
              href="/peta"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-pill hover:bg-white/20 text-white font-semibold text-sm shadow-md transition-all"
            >
              <Map className="w-4 h-4 text-emerald-300" />
              Jelajahi Peta Potensi &rarr;
            </Link>
          </div>
        </div>
      </HeroCarousel>

      {/* ── 2. StatCards — Floating Over Hero Bottom ───────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 w-full -mt-12 md:-mt-16 mb-20 relative z-30">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-card-hover border border-white/60 p-4 sm:p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          <div className="flex items-center gap-4 p-2 sm:p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl md:text-3xl text-[--text-primary]">
                {(profile.jumlah_penduduk ?? 0).toLocaleString("id-ID")}
              </div>
              <div className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                Jiwa Penduduk
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 sm:p-3 pt-4 lg:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl md:text-3xl text-[--text-primary]">
                {profile.luas_wilayah_ha ?? 0}
                <span className="text-base font-sans font-medium text-gray-500 ml-1">
                  Ha
                </span>
              </div>
              <div className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                Luas Wilayah
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 sm:p-3 pt-4 lg:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl md:text-3xl text-[--text-primary]">
                {profile.jumlah_dusun ?? 0}
              </div>
              <div className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                Wilayah Dusun
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 sm:p-3 pt-4 lg:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl md:text-3xl text-[--text-primary]">
                {stats.umkm}
              </div>
              <div className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                UMKM Terdata
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Sejarah & Rekam Jejak Budaya (Asymmetrical Magazine Layout) ─── */}
      <section id="sejarah" className="max-w-7xl mx-auto px-4 md:px-8 mb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Text editorial with rich typography */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[--color-primary-subtle] text-[--color-primary]">
              <Sparkles className="w-3.5 h-3.5" />
              REKAM JEJAK &amp; SEJARAH
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[--text-primary] leading-tight">
              Jejak Sejarah dan Identitas Desa Rambipuji
            </h2>

            <div className="text-[--text-secondary] leading-relaxed text-base sm:text-lg space-y-4">
              <p>
                Sejarah Desa Rambipuji tidak terlepas dari perkembangan masyarakat Jawa dan Madura di Kabupaten Jember. Berdasarkan profil resmi Pemerintah Desa Rambipuji, nama desa ini dikaitkan dengan tokoh lokal yang dikenal sebagai <strong>Sembah Puji</strong>. Dalam catatan sejarah desa, <strong>Broto Sentono</strong> disebut sebagai lurah pertama yang dikenal memiliki sifat dermawan, arif, dan bijaksana.
              </p>
              <p>
                Warisan sejarah tersebut menjadi bagian penting dari identitas masyarakat Rambipuji. Keberadaan Makam Mbah Puji dan Mbah Plecutan juga memperkaya cerita lokal yang hingga kini menjadi bagian dari ingatan dan tradisi masyarakat.
              </p>
              <p>
                Secara geografis, Desa Rambipuji terletak di Kecamatan Rambipuji, Kabupaten Jember, Jawa Timur, dan menjadi bagian dari kawasan pusat aktivitas Kecamatan Rambipuji. Profil resmi desa mencatat ketinggian wilayah sekitar <strong>145 meter di atas permukaan laut</strong>.
              </p>
              <p>
                Seiring perkembangan wilayah, Rambipuji memiliki karakter kawasan perkotaan yang ditandai dengan aktivitas perdagangan, jasa, permukiman, serta pelayanan publik. Di tengah dinamika tersebut, desa ini tetap mempertahankan kekayaan lokal berupa lanskap gumuk, wisata sejarah dan religi, wisata edukasi lingkungan, serta industri kreatif masyarakat.
              </p>
              <p>
                Perpaduan antara perkembangan perkotaan dan warisan lokal inilah yang membentuk identitas Desa Rambipuji saat ini.
              </p>
            </div>

            {/* Batas Wilayah Administratif */}
            <div className="mt-8 p-6 rounded-3xl bg-emerald-50/70 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif text-lg font-bold text-[--text-primary]">
                  Batas Wilayah Administratif
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">Utara</span>
                  <strong className="block text-[--text-primary] text-sm mt-1">Desa Rambigundam</strong>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">Selatan</span>
                  <strong className="block text-[--text-primary] text-sm mt-1">Desa Kaliwining</strong>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">Timur</span>
                  <strong className="block text-[--text-primary] text-sm mt-1">Desa Jubung</strong>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700">Barat</span>
                  <strong className="block text-[--text-primary] text-sm mt-1">Desa Rowotamtu</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Slot Gambar Alternatif (Kawasan Alun-Alun / Balai Desa / Sejarah) + Pusat Administrasi Balai Desa Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-xl border-4 border-white group bg-slate-100">
              <Image
                src={profile.foto_hero_url || "/katalog UMKM.png"}
                alt="Dokumentasi Balai Desa dan Kawasan Alun-Alun Rambipuji"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block mb-1">
                    Dokumentasi Kawasan Desa
                  </span>
                  <span className="text-sm font-semibold text-white drop-shadow">
                    Gedung Balai Desa &amp; Kawasan Alun-Alun Rambipuji
                  </span>
                </div>
              </div>
            </div>

            {/* Balai Desa MiniMap Card */}
            <div className="bg-white rounded-3xl p-5 border border-[--border-default] shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-bold text-[--text-primary]">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Pusat Administrasi &amp; Balai Desa</span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Infrastruktur
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-inner h-60">
                <MiniMap feature={balaiDesaFeature} boundaryFeature={boundaryFeature} />
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[--text-secondary]">
                <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="leading-snug">{resolvedContact.alamat}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Visi & Misi — Dark Emerald Editorial Section ────────────────── */}
      <section className="bg-slate-950 text-white py-24 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
              Arah &amp; Komitmen
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Visi &amp; Misi Pembangunan
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Visi */}
            <div className="lg:col-span-5 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl gradient-editorial flex flex-col justify-between">
              <div>
                <p className="tracking-widest text-xs text-emerald-300 font-semibold uppercase mb-4">
                  VISI DESA
                </p>
                <p
                  className="text-7xl leading-none mb-3 font-serif opacity-30 select-none text-emerald-200"
                >
                  &ldquo;
                </p>
                <p className="font-serif text-2xl sm:text-3xl font-normal italic leading-relaxed text-emerald-50">
                  {profile.visi}
                </p>
              </div>
              <div className="pt-8 border-t border-white/10 mt-6 text-xs text-emerald-200/80 uppercase tracking-widest">
                Pemerintah Desa Rambipuji
              </div>
            </div>

            {/* Misi */}
            <div className="lg:col-span-7 bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <p className="tracking-widest text-xs text-amber-400 font-semibold uppercase mb-6">
                  MISI STRATEGIS DESA
                </p>
                <ol className="space-y-4">
                  {resolvedMisi.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-serif font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/40">
                        {idx + 1}
                      </span>
                      <span className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Kontak & Informasi Pelayanan Warga ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-24 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[--color-primary-subtle] text-[--color-primary]">
            INFORMASI &amp; KONTAK DESA
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[--text-primary]">
            Hubungi Kantor Desa Rambipuji
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-3xl p-6 border border-[--border-default] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs text-[--text-muted] font-semibold tracking-wider uppercase mb-1">
                {label}
              </p>
              <p className="text-sm sm:text-base text-[--text-primary] font-medium leading-snug">
                {value || "-"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Kolaborasi Pengembangan WebGIS ───────────────────────────────── */}
      <section className="bg-white border-t border-[--border-default] py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[--text-primary] mb-2">
            Kolaborasi Pengembangan WebGIS
          </h3>
          <p className="text-xs sm:text-sm text-[--text-secondary] max-w-xl mx-auto mb-8">
            Digitalisasi potensi wisata dan industri kreatif Desa Rambipuji melalui kolaborasi Politeknik Negeri Jember dan Pemerintah Desa Rambipuji.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            <div className="flex items-center gap-3">
              <Image
                src="/logo Polije.png"
                alt="Logo Politeknik Negeri Jember"
                width={70}
                height={70}
                className="object-contain w-14 h-14 sm:w-16 sm:h-16"
              />
              <div className="text-left">
                <span className="block font-bold text-xs sm:text-sm text-[--text-primary]">
                  Politeknik Negeri Jember
                </span>
                <span className="text-[11px] text-[--text-muted]">
                  Pelaksana Program PkM · Pendanaan PNBP 2026
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Image
                src="/logo-kabupaten-jember.png"
                alt="Logo Pemerintah Desa Rambipuji"
                width={70}
                height={70}
                className="object-contain w-14 h-14 sm:w-16 sm:h-16"
              />
              <div className="text-left">
                <span className="block font-bold text-xs sm:text-sm text-[--text-primary]">
                  Pemerintah Desa Rambipuji
                </span>
                <span className="text-[11px] text-[--text-muted]">
                  Mitra Program · Pengelolaan Potensi Desa
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
