"use client";

import { Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FilterTabs from "../../components/FilterTabs";
import PotensiCard from "../../components/PotensiCard";
import SearchInput from "../../components/SearchInput";
import { usePotensi } from "../../hooks/usePotensi";
import type { KategoriSlug } from "../../types";

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

  return (
    <div className="min-h-screen bg-[--bg-surface] flex flex-col pt-16">
      {/* Sticky subheader */}
      <div className="sticky top-16 z-30 bg-white border-b border-[--border-default] px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <FilterTabs active={activeTab} onChange={setActiveTab} />
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari potensi desa..."
          />
        </div>
      </div>

      {/* Main content grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-[--border-default] overflow-hidden animate-pulse flex flex-col h-80"
              >
                <div className="w-full aspect-video bg-gray-200" />
                <div className="p-4 space-y-3 flex-grow">
                  <div className="w-24 h-5 bg-gray-200 rounded-full" />
                  <div className="w-3/4 h-5 bg-gray-200 rounded" />
                  <div className="w-full h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Gagal memuat data katalog potensi desa.
          </div>
        ) : filteredFeatures.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Tidak ada potensi ditemukan"
            description="Coba ubah kata kunci pencarian atau kategori filter Anda."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFeatures.map((feature) => (
              <PotensiCard
                key={`${feature.properties.kategori}-${feature.properties.id}`}
                feature={feature}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
