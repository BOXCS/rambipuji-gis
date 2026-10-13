"use client";

import { ChevronRight, ExternalLink, Home, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import CategoryBadge from "../../components/CategoryBadge";
import EmptyState from "../../components/EmptyState";
import FilterTabs from "../../components/FilterTabs";
import PotensiCard from "../../components/PotensiCard";
import SearchInput from "../../components/SearchInput";
import { usePotensi } from "../../hooks/usePotensi";
import type { KategoriSlug } from "../../types";

const FILTER_LABELS: Record<KategoriSlug | "semua", string> = {
  semua: "Semua",
  pertanian: "Pertanian",
  umkm: "UMKM",
  wisata: "Wisata",
  infrastruktur: "Infrastruktur",
  "batas-wilayah": "Batas Wilayah",
};

export default function PotensiPage() {
  const [activeTab, setActiveTab] = useState<KategoriSlug | "semua">("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, loading, error } = usePotensi();

  const filteredFeatures = useMemo(() => {
    if (!data || !data.features) {
      return [];
    }

    return data.features.filter((feature) => {
      const { kategori, nama, nama_usaha } = feature.properties;

      if (activeTab !== "semua" && kategori !== activeTab) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.trim().toLowerCase();
        const title = (nama || nama_usaha || "").toLowerCase();
        if (!title.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [data, activeTab, searchQuery]);

  const activeFilterLabel =
    activeTab !== "semua" ? FILTER_LABELS[activeTab] : null;

  return (
    <div className="min-h-screen bg-[--bg-base] flex flex-col pt-16">
      {/* Hero section — Cinematic tourism banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-20 px-4">
        {/* Background photo with subtle zoom */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-desa-1.jpg"
            alt="Pemandangan Desa Rambipuji"
            fill
            className="object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out"
            priority
          />
          {/* Layered cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-emerald-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb pill */}
          <div className="inline-flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            <span className="text-emerald-400 font-medium">Katalog Potensi</span>
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direktori Potensi & Destinasi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-4">
              Eksplorasi Keunggulan <br className="hidden sm:inline" />
              <span className="text-emerald-400 italic">Desa Rambipuji</span>
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
              Telusuri pesona destinasi wisata, kreativitas produk UMKM masyarakat,
              lumbung hasil tani agraris, serta infrastruktur penunjang kehidupan desa.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky filter & search bar — Frosted Glass */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <FilterTabs active={activeTab} onChange={setActiveTab} />
          <div className="w-full md:max-w-xs flex-shrink-0">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari potensi atau nama usaha..."
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 w-full">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Memuat katalog potensi...</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100 text-xs">
              {filteredFeatures.length} Potensi Ditemukan
            </span>
            {activeFilterLabel && (
              <span className="text-slate-500">
                Filter: <strong className="text-slate-900">{activeFilterLabel}</strong>
              </span>
            )}
            {searchQuery.trim() !== "" && (
              <span className="text-slate-500">
                Kata kunci: &ldquo;<strong className="text-slate-900">{searchQuery}</strong>&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main content grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse flex flex-col"
              >
                <div className="w-full aspect-[16/10] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
                  <div className="w-full h-3 bg-slate-200 rounded" />
                  <div className="w-5/6 h-3 bg-slate-200 rounded" />
                  <div className="w-full h-10 bg-slate-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 text-red-700">
            <p className="font-medium">Gagal memuat data katalog potensi desa.</p>
            <p className="text-xs text-red-500 mt-1">Silakan muat ulang halaman atau periksa koneksi Anda.</p>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">
              Tidak Ada Potensi yang Sesuai
            </h2>
            <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
              Kami tidak menemukan data untuk pencarian atau filter yang dipilih. Silakan ubah filter atau gunakan kata kunci lain.
            </p>
            {(searchQuery.trim() !== "" || activeTab !== "semua") && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {searchQuery.trim() !== "" && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition"
                  >
                    Hapus Kata Kunci
                  </button>
                )}
                {activeTab !== "semua" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("semua")}
                    className="text-xs font-semibold uppercase tracking-wider text-white bg-slate-900 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-sm transition"
                  >
                    Lihat Semua Kategori
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredFeatures.map((feature) => (
              <PotensiCard
                key={`${feature.properties.kategori}-${feature.properties.id ?? feature.id}`}
                feature={feature}
              />
            ))}

            {/* Kartu Portal Katalog UMKM di Bagian Akhir List Potensi */}
            {(activeTab === "semua" || activeTab === "umkm") && (
              <div className="group bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full ring-1 ring-amber-400/20">
                {/* Photo area */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src="/katalog UMKM.png"
                    alt="Portal Katalog UMKM Masyarakat Desa Rambipuji"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />
                  <div className="absolute top-3 left-3 z-10 shadow-sm backdrop-blur-md">
                    <CategoryBadge kategori="umkm" />
                  </div>
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-amber-200 text-xs font-medium drop-shadow-md">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>Portal Eksternal UMKM</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    UMKM Masyarakat Desa Rambipuji
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-2 flex-grow leading-relaxed">
                    Jelajahi ekosistem & direktori lengkap produk olahan dan karya UMKM warga Desa Rambipuji secara interaktif melalui portal katalog khusus.
                  </p>

                  <div className="border-t border-slate-100 mt-4 pt-3.5">
                    <a
                      href="https://katalog-preview-by-relva-studio-plum.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm hover:shadow group/btn transition-all duration-200"
                    >
                      <span>Buka Katalog UMKM</span>
                      <ExternalLink className="h-4 w-4 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
