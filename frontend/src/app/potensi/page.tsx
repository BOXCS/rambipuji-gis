"use client";

import { ChevronRight, Home, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
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
      {/* Hero section */}
      <section
        className="text-white py-12 px-4"
        style={{
          background:
            "linear-gradient(to bottom right, var(--color-primary), #145235)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <Home className="h-4 w-4" />
            <span>Beranda</span>
            <ChevronRight className="h-4 w-4" />
            <span>Potensi Desa</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">
            Potensi Desa Rambipuji
          </h1>
          <p className="text-white/80 text-base max-w-xl">
            Jelajahi seluruh potensi unggulan desa kami — dari pertanian, usaha
            warga, wisata budaya, hingga fasilitas umum.
          </p>
        </div>
      </section>

      {/* Sticky filter & search bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-[--border-default] shadow-sm">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto px-4 py-3">
          <FilterTabs active={activeTab} onChange={setActiveTab} />
          <div className="max-w-xs w-full hidden sm:block">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari potensi desa..."
            />
          </div>
        </div>
        {/* Mobile search bar below tabs */}
        <div className="px-4 pb-3 sm:hidden">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari potensi desa..."
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 text-sm text-[--text-secondary] w-full">
        {loading ? (
          <span>Memuat data...</span>
        ) : (
          <>
            <span>{filteredFeatures.length} potensi ditemukan</span>
            {activeFilterLabel && (
              <span className="text-[--color-primary]">
                Menampilkan: {activeFilterLabel}
              </span>
            )}
            {searchQuery.trim() !== "" && (
              <span className="text-[--text-muted]">
                Pencarian: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </>
        )}
      </div>

      {/* Main content grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-[--border-default] overflow-hidden animate-pulse flex flex-col"
              >
                <div className="w-full aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="w-3/4 h-4 bg-gray-200 rounded" />
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-5/6 h-3 bg-gray-200 rounded" />
                  <div className="w-full h-8 bg-gray-200 rounded-lg mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Gagal memuat data katalog potensi desa.
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Search className="h-16 w-16 text-[--text-muted] mb-4" />
            <h2 className="text-lg font-semibold text-[--text-primary] mb-1">
              Belum ada potensi ditemukan
            </h2>
            <p className="text-sm text-[--text-secondary] mb-4">
              Coba ubah filter atau kata pencarian Anda
            </p>
            {(searchQuery.trim() !== "" || activeTab !== "semua") && (
              <div className="flex gap-3">
                {searchQuery.trim() !== "" && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-[--text-secondary] hover:bg-[--bg-surface-raised] px-4 py-2 rounded-lg transition-colors"
                  >
                    Hapus pencarian
                  </button>
                )}
                {activeTab !== "semua" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("semua")}
                    className="text-sm text-[--color-primary] hover:bg-[--color-primary-subtle] px-4 py-2 rounded-lg transition-colors"
                  >
                    Lihat semua kategori
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <PotensiCard
                key={`${feature.properties.kategori}-${feature.properties.id ?? feature.id}`}
                feature={feature}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
