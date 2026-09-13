import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { PotensiFeature } from "../types";
import CategoryBadge from "./CategoryBadge";
import ImageCarousel from "./ImageCarousel";

export interface PotensiCardProps {
  feature: PotensiFeature;
}

export default function PotensiCard({ feature }: PotensiCardProps) {
  const { id, nama, nama_usaha, foto, foto_list_urls, kategori, deskripsi } =
    feature.properties;
  const title = nama || nama_usaha || "Tanpa Nama";
  const featureId = id ?? feature.id ?? null;
  const detailHref =
    kategori && featureId ? `/potensi/${kategori}/${featureId}` : null;

  // Build images array — prefer foto_list_urls, fall back to single foto
  const images: string[] =
    foto_list_urls && foto_list_urls.length > 0
      ? foto_list_urls
      : foto
      ? [foto]
      : [];

  return (
    <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Photo area — carousel (no auto-play on card) with CategoryBadge overlay */}
      <div className="relative w-full aspect-video overflow-hidden">
        <ImageCarousel images={images} alt={title} autoPlay={false} />
        {/* CategoryBadge overlaid bottom-left on photo */}
        <div className="absolute bottom-2 left-2 z-10">
          <CategoryBadge kategori={kategori} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base text-[--text-primary] line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-[--text-secondary] line-clamp-2 mt-1 flex-grow">
          {deskripsi ||
            "Informasi potensi desa di kawasan Rambipuji, Kabupaten Jember."}
        </p>

        {/* Location row */}
        <div className="flex items-center gap-1 mt-2">
          <MapPin className="h-3.5 w-3.5 text-[--text-muted] flex-shrink-0" />
          <span className="text-xs text-[--text-muted]">Desa Rambipuji</span>
        </div>

        {/* "Lihat Detail" button — only shown when href is valid */}
        {detailHref && (
          <div className="border-t border-[--border-default] mt-3 pt-3">
            <Link
              href={detailHref}
              className="w-full flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-subtle] transition-colors duration-150"
            >
              Lihat Detail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
