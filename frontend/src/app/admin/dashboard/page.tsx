"use client";

import {
  Building2,
  Calendar,
  Leaf,
  Mountain,
  Plus,
  Store,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CategoryBadge from "../../../components/CategoryBadge";
import StatCard from "../../../components/StatCard";
import { useAuth } from "../../../hooks/useAuth";
import { adminGetPotensiList, getStatistik } from "../../../lib/api";
import type { KategoriSlug, PotensiFeature, StatistikData } from "../../../types";

const CATEGORIES: KategoriSlug[] = [
  "pertanian",
  "umkm",
  "wisata",
  "infrastruktur",
];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [statistik, setStatistik] = useState<StatistikData>({
    pertanian: 0,
    umkm: 0,
    wisata: 0,
    infrastruktur: 0,
    total: 0,
  });

  const [recentFeatures, setRecentFeatures] = useState<PotensiFeature[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getStatistik()
      .then((data) => {
        if (isMounted && data) {
          setStatistik(data);
        }
      })
      .catch(() => {
        // fallback to 0
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setLoadingRecent(true);

    Promise.all(
      CATEGORIES.map((cat) =>
        adminGetPotensiList(cat, token).catch(() => ({
          type: "FeatureCollection" as const,
          features: [] as PotensiFeature[],
        }))
      )
    )
      .then((results) => {
        if (!isMounted) return;

        const allFeatures: PotensiFeature[] = [];
        for (const res of results) {
          if (res.features) {
            allFeatures.push(...res.features);
          }
        }

        allFeatures.sort((a, b) => {
          const dateA = a.properties.created_at || "";
          const dateB = b.properties.created_at || "";
          return dateB.localeCompare(dateA);
        });

        setRecentFeatures(allFeatures.slice(0, 5));
        setLoadingRecent(false);
      })
      .catch(() => {
        if (isMounted) {
          setLoadingRecent(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Page Header & Quick Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[--text-primary]">
            Dashboard Ringkasan
          </h2>
          <p className="text-xs text-[--text-secondary]">
            Pantau statistik data potensi desa dan aktivitas entri terbaru.
          </p>
        </div>

        <Link
          href="/admin/data/pertanian"
          className="inline-flex items-center px-4 py-2.5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Data Baru
        </Link>
      </div>

      {/* StatCard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Leaf}
          value={statistik.pertanian}
          label="Pertanian & Perkebunan"
        />
        <StatCard icon={Store} value={statistik.umkm} label="UMKM & Usaha" />
        <StatCard
          icon={Mountain}
          value={statistik.wisata}
          label="Wisata & Budaya"
        />
        <StatCard
          icon={Building2}
          value={statistik.infrastruktur}
          label="Infrastruktur"
        />
      </div>

      {/* Recent Data Section */}
      <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden">
        <div className="px-5 py-4 border-b border-[--border-default] flex items-center justify-between bg-[--bg-surface]">
          <h3 className="font-bold text-sm text-[--text-primary]">
            5 Entri Data Terakhir
          </h3>
          <span className="text-xs text-[--text-secondary]">
            Diurutkan berdasarkan waktu pembuatan
          </span>
        </div>

        {loadingRecent ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-full h-12 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : recentFeatures.length === 0 ? (
          <div className="p-8 text-center text-xs text-[--text-muted]">
            Belum ada data yang tercatat di sistem.
          </div>
        ) : (
          <div className="divide-y divide-[--border-default]">
            {recentFeatures.map((feature) => {
              const { id, nama, nama_usaha, kategori, created_at } =
                feature.properties;
              const title = nama || nama_usaha || "Tanpa Nama";
              const formattedDate = created_at
                ? new Date(created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Baru saja";

              return (
                <div
                  key={`${kategori}-${id}`}
                  className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[--bg-surface] transition"
                >
                  <div className="flex items-center space-x-3">
                    <CategoryBadge kategori={kategori} />
                    <span className="text-sm font-semibold text-[--text-primary]">
                      {title}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-[--text-secondary]">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[--text-muted]" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
