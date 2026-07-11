import { MapPin, Mountain } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { PotensiFeature } from "../types";
import CategoryBadge from "./CategoryBadge";

export interface PotensiCardProps {
  feature: PotensiFeature;
}

export default function PotensiCard({ feature }: PotensiCardProps) {
  const { id, nama, nama_usaha, foto, kategori, deskripsi } = feature.properties;
  const title = nama || nama_usaha || "Tanpa Nama";
  const detailHref = kategori && id ? `/potensi/${kategori}/${id}` : null;

  return (
    <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="relative w-full aspect-video bg-[--color-neutral-subtle] flex items-center justify-center overflow-hidden">
        {foto ? (
          <img
            src={foto}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[--text-muted]">
            <Mountain className="w-10 h-10 mb-1 opacity-60" />
            <span className="text-xs">Foto tidak tersedia</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <CategoryBadge kategori={kategori} />
          <span className="inline-flex items-center text-xs text-[--text-secondary]">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[--color-primary]" />
            Rambipuji
          </span>
        </div>

        <h3 className="text-base font-semibold text-[--text-primary] mb-1 line-clamp-1">
          {title}
        </h3>

        <p className="text-sm text-[--text-secondary] mb-4 line-clamp-2 flex-grow">
          {deskripsi ||
            "Informasi potensi desa di kawasan Rambipuji, Kabupaten Jember."}
        </p>

        {detailHref && (
          <div className="pt-2 border-t border-[--border-default]">
            <Link
              href={detailHref}
              className="text-sm font-medium text-[--color-primary] hover:text-[--color-primary-hover] inline-flex items-center transition"
            >
              Lihat Detail →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
