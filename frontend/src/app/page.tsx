import {
  ArrowRight,
  BookOpen,
  Building2,
  Camera,
  Compass,
  ExternalLink,
  Layers,
  Map,
  MapPin,
  Ruler,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import HeroCarousel, { HeroCarouselImage } from "../components/HeroCarousel";
import JsonLd from "../components/JsonLd";
import {
  getBatasWilayah,
  getDesaProfile,
  getPotensiAll,
  getStatistik,
} from "../lib/api";
import type {
  DesaProfile,
  PotensiCollection,
  StatistikData,
} from "../types";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Beranda | Pesona Wisata & WebGIS Desa Rambipuji",
  description:
    "Jelajahi keindahan panorama alam, kearifan tradisi sentra tempe, geliat UMKM, dan pemetaan digital Desa Rambipuji, Kabupaten Jember.",
};

const fallbackProfile: DesaProfile = {
  nama_desa: "Desa Rambipuji",
  kecamatan: "Rambipuji",
  kabupaten: "Kabupaten Jember",
  provinsi: "Jawa Timur",
  kode_pos: "68152",
  luas_wilayah_ha: 365.56,
  jumlah_penduduk: 12450,
  jumlah_dusun: 4,
  visi: "Terwujudnya Desa Rambipuji yang Maju, Sejahtera, Berbudaya, dan Berdaya Saing Berbasis Potensi Lokal dan Teknologi Informasi.",
  misi: [
    "Meningkatkan kualitas pelayanan publik berbasis digital.",
    "Mengembangkan potensi UMKM, pariwisata, dan infrastruktur desa.",
    "Mendorong kemandirian ekonomi masyarakat melalui pemberdayaan dan inovasi lokal.",
  ],
  sejarah:
    "Desa Rambipuji merupakan salah satu desa bersejarah di Kabupaten Jember yang memiliki kekayaan alam berupa gumuk-gumuk eksotis, sentra industri kerajinan tempe turun-temurun, serta kemajuan infrastruktur terintegrasi.",
  deskripsi:
    "Desa Rambipuji adalah desa dinamis di Kabupaten Jember dengan sentra UMKM tempe legendaris, warisan wisata budaya gumuk, dan infrastruktur terintegrasi.",
  alamat_kantor: "Jl. Balai Desa No. 1, Rambipuji, Jember",
  email: "desa.rambipuji@jemberkab.go.id",
  telepon: "(0331) 711xxx",
  jam_pelayanan: "Senin - Jumat: 08.00 - 15.00 WIB",
};

export default async function HomePage() {
  let profile: DesaProfile = fallbackProfile;
  try {
    const fetched = await getDesaProfile();
    if (fetched) profile = fetched;
  } catch {
    // fallback
  }

  let stats: StatistikData = {
    pertanian: 0,
    umkm: 2,
    wisata: 0,
    infrastruktur: 0,
    total: 2,
  };
  try {
    const fetchedStats = await getStatistik();
    if (fetchedStats) stats = fetchedStats;
  } catch {
    // fallback
  }

  let potensiData: PotensiCollection | null = null;
  try {
    potensiData = await getPotensiAll();
  } catch {
    // fallback
  }

  // Build hero imagery from database + authentic curated travel imagery
  const heroImages: HeroCarouselImage[] = [];

  if (profile.foto_hero_url) {
    heroImages.push({
      url: profile.foto_hero_url,
      title: `Lanskap Resmi ${profile.nama_desa}`,
    });
  }

  if (potensiData && potensiData.features) {
    potensiData.features.forEach((feat) => {
      const p = feat.properties;
      const title = p.nama || p.nama_usaha || "Potensi Unggulan";
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

  // Fallbacks if fewer than 2 images are registered yet
  if (heroImages.length === 0) {
    heroImages.push({
      url: "/katalog UMKM.png",
      title: "Sentra Kerajinan & UMKM Warga Rambipuji",
    });
    heroImages.push({
      url: "/logo-kabupaten-jember.png",
      title: "Desa Rambipuji, Kabupaten Jember",
    });
  }

  return (
    <div className="min-h-screen bg-[--bg-base] text-[--text-primary] flex flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: "Desa Rambipuji",
          description: profile.visi,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Rambipuji",
            addressRegion: "Jember",
            addressCountry: "ID",
          },
        }}
      />

      {/* ── 1. Hero Section — Fullscreen Immersive Tourism Showcase ────────── */}
      <HeroCarousel
        images={heroImages}
        fullScreen={true}
        showScrollPrompt={true}
        overlayGradient="linear-gradient(180deg, rgba(6, 26, 16, 0.45) 0%, rgba(6, 26, 16, 0.70) 55%, rgba(4, 18, 11, 0.96) 100%)"
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow / Kicker */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase glass-pill text-white/95 shadow-lg mb-6 hover:bg-white/20 transition-all">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>JELAJAHI PESONA RAMBIPUJI · JEMBER BARAT</span>
          </div>

          {/* Expressive Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] mb-6 text-shadow-hero">
            Jejak Sejarah, Tradisi, dan Kreativitas Warga
            <span className="block mt-2 font-serif italic text-emerald-300 font-normal">
              Desa Rambipuji
            </span>
          </h1>

          {/* Engaging Subtitle / Paragraf Deskripsi */}
          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto font-sans leading-relaxed mb-10 text-shadow-subtle">
            Selamat datang di gerbang digital Desa Rambipuji. Temukan kekayaan
            lanskap gumuk, warisan sejarah dan wisata religi, ruang edukasi
            lingkungan, serta industri kreatif masyarakat yang terus berkembang di
            tengah dinamika kawasan perkotaan Jember bagian barat.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/peta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Map className="w-5 h-5" />
              Jelajahi Peta Digital
            </Link>

            <Link
              href="/potensi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full glass-pill hover:bg-white/25 text-white font-semibold text-sm sm:text-base shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <Compass className="w-5 h-5 text-amber-300" />
              Temukan Potensi Desa
            </Link>
          </div>
        </div>
      </HeroCarousel>

      {/* ── 2. Floating Stats Bar (Elevated over Hero Bottom) ──────────────── */}
      <section className="relative z-30 -mt-12 md:-mt-16 max-w-6xl mx-auto px-4 w-full">
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
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl md:text-3xl text-[--text-primary]">
                {stats.umkm ?? 0}
              </div>
              <div className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                UMKM Warga
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 sm:p-3 pt-4 lg:pt-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl md:text-3xl text-[--text-primary]">
                {stats.total ?? 0}
              </div>
              <div className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                Titik Potensi Peta
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Storytelling & Narasi Budaya Desa ────────────────────────────── */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Big Typography Editorial */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[--color-primary-subtle] text-[--color-primary]">
              <Sparkles className="w-3.5 h-3.5" />
              Cerita Dari Jember Barat
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[--text-primary] leading-tight">
              Di Tengah Dinamika Perkotaan, Warisan Lokal Tetap Hidup
            </h2>

            <p className="text-base sm:text-lg text-[--text-secondary] leading-relaxed">
              Desa Rambipuji merupakan kawasan berkarakter perkotaan di bagian barat Kota Jember yang terus berkembang melalui aktivitas perdagangan, jasa, permukiman, dan ekonomi masyarakat. Di tengah dinamika tersebut, Rambipuji menyimpan kekayaan lokal yang khas, mulai dari lanskap <strong>Gumuk Gong dan Gumuk Dempet</strong>, jejak sejarah dan wisata religi <strong>Makam Mbah Puji dan Mbah Plecutan</strong>, hingga <strong>sentra produksi tempe</strong> yang menjadi bagian dari identitas ekonomi masyarakat secara turun-temurun.
            </p>

            <p className="text-base sm:text-lg text-[--text-secondary] leading-relaxed">
              Perpaduan antara perkembangan kawasan perkotaan, warisan sejarah, potensi wisata, dan industri kreatif menjadikan Rambipuji memiliki daya tarik tersendiri untuk dikenali dan dijelajahi.
            </p>

            <blockquote className="border-l-4 border-emerald-600 pl-4 py-2 italic font-serif text-lg text-emerald-900 bg-emerald-50/60 rounded-r-xl">
              &ldquo;Di tengah kawasan yang terus berkembang, Rambipuji menjaga cerita masa lalu, merawat potensi lokal, dan menggerakkan kreativitas masyarakatnya.&rdquo;
            </blockquote>

            <div className="pt-2">
              <Link
                href="/tentang"
                className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800 hover:gap-3 transition-all"
              >
                Baca Sejarah &amp; Profil Lengkap &rarr;
              </Link>
            </div>
          </div>

          {/* Right: Immersive Asymmetrical Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <Image
                src={profile.foto_hero_url || "/katalog UMKM.png"}
                alt="Pesona Desa Rambipuji"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-1">
                  Dokumentasi Resmi Desa
                </span>
                <p className="text-white font-serif text-xl md:text-2xl font-bold">
                  Kearifan Lokal yang Bertumbuh Bersama Digitalisasi
                </p>
              </div>
            </div>

            {/* Floating accent badge */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100 items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-xs leading-snug">
                <strong className="block text-[--text-primary] font-semibold">
                  Sentra Tempe Warga
                </strong>
                <span className="text-[--text-muted]">
                  Tradisi kuliner khas yang diakui luas
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Sektor Potensi Unggulan — Large Visual Tourism Cards ────────── */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 mb-3">
                <Layers className="w-3.5 h-3.5" />
                Pilar Kekayaan Lokal
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Jelajahi Kekayaan Lokal Rambipuji
              </h2>
            </div>
            <p className="text-gray-300 text-sm md:text-base max-w-xl leading-relaxed">
              Temukan perpaduan warisan sejarah, lanskap gumuk, wisata religi, edukasi lingkungan, industri kreatif, dan ruang publik yang tetap hidup di tengah perkembangan kawasan perkotaan Rambipuji.
            </p>
          </div>

          {/* Large Visual Card Grid — 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Wisata & Budaya */}
            <Link
              href="/potensi?kategori=Wisata"
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800 shadow-xl border border-white/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-end p-6"
            >
              <Image
                src={heroImages[0]?.url || "/katalog UMKM.png"}
                alt="Jejak Gumuk dan Sejarah Desa"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-85"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/80 text-white backdrop-blur-md">
                  <Compass className="w-3.5 h-3.5" />
                  Wisata &amp; Budaya
                </span>
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Jejak Gumuk dan Sejarah Desa
                </h3>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  Jelajahi Gumuk Gong, Gumuk Dempet, serta kekayaan sejarah dan budaya yang menjadi identitas Desa Rambipuji.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2.5 transition-all">
                  <span>Jelajahi Wisata &rarr;</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Industri Kreatif & UMKM */}
            <Link
              href="/potensi?kategori=UMKM"
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800 shadow-xl border border-white/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-end p-6"
            >
              <Image
                src="/katalog UMKM.png"
                alt="Sentra Tempe & Usaha Warga"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-85"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/80 text-white backdrop-blur-md">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Industri Kreatif &amp; UMKM
                </span>
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Sentra Tempe &amp; Usaha Warga
                </h3>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  Kenali tradisi produksi tempe secara turun-temurun dan ragam usaha lokal yang menggerakkan perekonomian masyarakat.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:gap-2.5 transition-all">
                  <span>Jelajahi Katalog UMKM &rarr;</span>
                </div>
              </div>
            </Link>

            {/* Card 3: Wisata Religi & Edukasi */}
            <Link
              href="/potensi?kategori=Wisata"
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800 shadow-xl border border-white/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-end p-6"
            >
              <Image
                src={heroImages[1]?.url || heroImages[0]?.url || "/katalog UMKM.png"}
                alt="Warisan Religi & Ruang Edukasi"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-85"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/80 text-white backdrop-blur-md">
                  <BookOpen className="w-3.5 h-3.5" />
                  Wisata Religi &amp; Edukasi
                </span>
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Warisan Religi &amp; Ruang Edukasi
                </h3>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  Temukan kisah Makam Mbah Puji dan Mbah Plecutan serta Taman Edukasi Kampung Dinoyo sebagai ruang pelestarian sejarah dan pembelajaran lingkungan.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2.5 transition-all">
                  <span>Jelajahi Wisata Religi &amp; Edukasi &rarr;</span>
                </div>
              </div>
            </Link>

            {/* Card 4: Ruang Publik & Perkotaan */}
            <Link
              href="/potensi?kategori=Infrastruktur"
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-800 shadow-xl border border-white/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-end p-6"
            >
              <Image
                src={heroImages[2]?.url || profile.foto_hero_url || "/logo-kabupaten-jember.png"}
                alt="Alun-Alun & Pusat Aktivitas Warga"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-85"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/80 text-white backdrop-blur-md">
                  <Building2 className="w-3.5 h-3.5" />
                  Ruang Publik &amp; Perkotaan
                </span>
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  Alun-Alun &amp; Pusat Aktivitas Warga
                </h3>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  Ruang pertemuan masyarakat yang mencerminkan dinamika sosial, budaya, pelayanan publik, dan perkembangan kawasan perkotaan Rambipuji.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-400 group-hover:gap-2.5 transition-all">
                  <span>Jelajahi Ruang Publik &rarr;</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Teaser Peta GIS Interaktif ──────────────────────────────────── */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="rounded-3xl p-8 md:p-14 text-white relative overflow-hidden shadow-2xl gradient-editorial">
          {/* Subtle background overlay rings */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/20 backdrop-blur-md text-white border border-white/25">
                <Map className="w-3.5 h-3.5" />
                JELAJAHI PETA DIGITAL DESA
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Temukan Potensi Rambipuji dalam Satu Peta
              </h2>
              <p className="text-white/85 text-base sm:text-lg max-w-xl leading-relaxed">
                Jelajahi sebaran wisata sejarah, lanskap gumuk, wisata religi, ruang edukasi, dan industri kreatif Desa Rambipuji melalui peta digital interaktif. Temukan lokasi, foto, cerita lokal, serta informasi menarik dari setiap potensi dalam satu platform yang mudah diakses.
              </p>

              {/* 3 Nilai Manfaat Pengguna */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/15">
                  <MapPin className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-snug">
                    <strong className="block text-white font-semibold mb-0.5">Temukan Lokasi</strong>
                    <span className="text-white/80">Kenali sebaran potensi melalui peta interaktif.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/15">
                  <Compass className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-snug">
                    <strong className="block text-white font-semibold mb-0.5">Kenali Ceritanya</strong>
                    <span className="text-white/80">Baca sejarah, keunikan, dan daya tarik tiap lokasi.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/15">
                  <Camera className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-snug">
                    <strong className="block text-white font-semibold mb-0.5">Lihat Dokumentasi</strong>
                    <span className="text-white/80">Jelajahi foto dan informasi pendukung potensi desa.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/peta"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-emerald-900 font-bold text-base hover:bg-emerald-50 transition-all shadow-lg hover:-translate-y-0.5"
                >
                  <Map className="w-5 h-5 text-emerald-700" />
                  Jelajahi Peta Interaktif &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 text-left space-y-4 max-w-sm shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Satu Peta, Beragam Cerita Desa
                </h4>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  Dari Gumuk Gong dan Gumuk Dempet hingga wisata religi, Taman Edukasi Kampung Dinoyo, Alun-Alun Rambipuji, UMKM dan sentra tempe warga. Temukan setiap potensi melalui titik lokasi yang dilengkapi informasi dan dokumentasi visual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Portal Katalog UMKM Sinergi Eksternal ───────────────────────── */}
      <section className="pb-20 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="bg-white rounded-3xl border border-[--border-default] overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 relative aspect-video lg:aspect-auto lg:h-full min-h-[260px] bg-gray-100">
            <Image
              src="/katalog UMKM.png"
              alt="Katalog UMKM Desa Rambipuji"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              <ShoppingBag className="w-3.5 h-3.5" />
              KOLABORASI DIGITAL UNTUK UMKM DESA
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[--text-primary]">
              Jelajahi Katalog UMKM Desa Rambipuji
            </h3>
            <p className="text-sm sm:text-base text-[--text-secondary] leading-relaxed">
              Kenali lebih dekat beragam produk dan usaha masyarakat Desa Rambipuji melalui katalog digital UMKM yang dikembangkan oleh tim Pengabdian kepada Masyarakat Politeknik Negeri Jember. WebGIS membantu pengunjung menemukan lokasi dan sebaran potensi usaha, sementara katalog UMKM menyajikan profil pelaku usaha, informasi produk, dan pilihan kuliner maupun produk lokal secara lebih lengkap.
            </p>
            <div className="pt-2">
              <a
                href="https://katalog-preview-by-relva-studio-plum.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[--color-primary] hover:bg-[--color-primary-hover] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg"
              >
                <span>Jelajahi Katalog UMKM</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Kolaborasi Pengembangan WebGIS ───────────────────────────────── */}
      <section className="bg-white border-t border-[--border-default] py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-serif font-bold text-[--text-primary] mb-2">
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
