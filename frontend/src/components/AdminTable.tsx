"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import type { KategoriSlug, PotensiFeature } from "../types";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";

export interface AdminTableProps {
  features: PotensiFeature[];
  kategori: KategoriSlug;
  onDelete: (id: number) => void;
  loading: boolean;
}

function getCenterCoordinates(
  geometry: PotensiFeature["geometry"]
): [number, number] {
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    return [lat, lng];
  }

  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] || [];
    if (ring.length === 0) return [-8.25, 113.6];
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return [sumLat / ring.length, sumLng / ring.length];
  }

  if (geometry.type === "MultiPolygon") {
    const poly = geometry.coordinates[0] || [];
    const ring = poly[0] || [];
    if (ring.length === 0) return [-8.25, 113.6];
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return [sumLat / ring.length, sumLng / ring.length];
  }

  return [-8.25, 113.6];
}

export default function AdminTable({
  features,
  kategori,
  onDelete,
  loading,
}: AdminTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const featureToDelete = features.find(
    (f) => (f.id ?? f.properties?.id) === deleteId
  );
  const deleteName =
    featureToDelete?.properties?.nama ||
    featureToDelete?.properties?.nama_usaha ||
    `ID #${deleteId}`;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden">
        <EmptyState
          icon={Trash2}
          title="Belum ada data pada kategori ini"
          description="Klik tombol Tambah Baru di atas untuk merekam entri pertama."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[--bg-surface] border-b border-[--border-default] text-xs font-semibold text-[--text-secondary]">
                <th className="px-4 py-3.5 w-14 text-center">No</th>
                <th className="px-4 py-3.5">Nama Entri</th>
                <th className="px-4 py-3.5">Koordinat (Lat, Lng)</th>
                <th className="px-4 py-3.5">Tanggal Dibuat</th>
                <th className="px-4 py-3.5 w-28 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default] text-sm">
              {features.map((feature, idx) => {
                const id = feature.id ?? feature.properties?.id ?? null;
                if (!id) {
                  console.warn("AdminTable: feature missing id", feature);
                }
                const p = feature.properties || {};
                const { nama, nama_usaha, created_at } = p;
                const title = nama || nama_usaha || "Tanpa Nama";
                const [lat, lng] = getCenterCoordinates(feature.geometry);
                const coordsStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                const dateStr = created_at
                  ? new Date(created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

                const editHref = id
                  ? `/admin/data/${kategori}/${id}/edit`
                  : `/admin/data/${kategori}`;

                return (
                  <tr
                    key={`${kategori}-${id ?? idx}`}
                    className="hover:bg-[--bg-surface] transition"
                  >
                    <td className="px-4 py-3.5 text-center text-xs text-[--text-muted]">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[--text-primary]">
                      {title}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[--text-secondary]">
                      {coordsStr}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[--text-secondary]">
                      {dateStr}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Link
                        href={editHref}
                        className="inline-flex items-center justify-center p-1.5 text-[--text-secondary] hover:text-[--color-primary] hover:bg-[--color-primary-subtle] rounded-lg transition"
                        title="Edit Data"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => id && setDeleteId(id)}
                        className="inline-flex items-center justify-center p-1.5 text-[--text-secondary] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Konfirmasi Hapus Data"
        description={`Apakah Anda yakin ingin menghapus data "${deleteName}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
