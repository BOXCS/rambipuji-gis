"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import AdminTable from "../../../../components/AdminTable";
import Toast from "../../../../components/Toast";
import { useAuth } from "../../../../hooks/useAuth";
import { adminDeletePotensi, adminGetPotensiList } from "../../../../lib/api";
import type { KategoriSlug, PotensiFeature } from "../../../../types";

const VALID_KATEGORI: KategoriSlug[] = [
  "pertanian",
  "umkm",
  "wisata",
  "infrastruktur",
];

const LABEL_MAP: Record<KategoriSlug, string> = {
  pertanian: "Pertanian & Perkebunan",
  umkm: "UMKM & Usaha Warga",
  wisata: "Wisata & Budaya",
  infrastruktur: "Infrastruktur",
  "batas-wilayah": "Batas Wilayah",
};

export default function AdminDataKategoriPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();

  const rawSlug = String(params?.kategori || "").toLowerCase();
  const isValid = VALID_KATEGORI.includes(rawSlug as KategoriSlug);
  const kategori = rawSlug as KategoriSlug;

  const [features, setFeatures] = useState<PotensiFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!isValid) {
      router.push("/admin/dashboard");
    }
  }, [isValid, router]);

  const fetchFeatures = useCallback(async () => {
    if (!token || !isValid) return;

    setLoading(true);
    try {
      const collection = await adminGetPotensiList(kategori, token);
      setFeatures(collection.features || []);
    } catch {
      setToastMessage({
        text: "Gagal memuat data dari peladen.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token, isValid, kategori]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      await adminDeletePotensi(kategori, id, token);
      setFeatures((prev) => prev.filter((f) => f.properties.id !== id));
      setToastMessage({
        text: "Data berhasil dihapus.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus entri data.";
      setToastMessage({
        text: msg,
        type: "error",
      });
    }
  };

  if (!isValid) {
    return null;
  }

  const label = LABEL_MAP[kategori] || kategori;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[--text-primary]">
            Data {label}
          </h2>
          <p className="text-xs text-[--text-secondary]">
            Kelola dan perbarui seluruh entri spasial pada kategori {label}.
          </p>
        </div>

        <Link
          href={`/admin/data/${kategori}/tambah`}
          className="inline-flex items-center px-4 py-2.5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah {label} Baru
        </Link>
      </div>

      {/* AdminTable */}
      <AdminTable
        features={features}
        kategori={kategori}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
