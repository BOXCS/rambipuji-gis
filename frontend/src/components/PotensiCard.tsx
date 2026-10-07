import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { PotensiFeature } from "../types";
import CategoryBadge from "./CategoryBadge";
import ImageCarousel from "./ImageCarousel";

export interface PotensiCardProps {
  feature: PotensiFeature;
}

function getCardDescription(properties: Record<string, any>): string {
  const {
    deskripsi,
    kategori,
    komoditas,
    luas_ha,
    hasil_panen,
    nama_pemilik,
    jenis_produk,
    jam_operasional,
    jam_kunjungan,
    harga_tiket,
    jenis_fasilitas,
    kondisi,
    pengelola,
  } = properties;

  if (deskripsi && String(deskripsi).trim() !== "") {
    return String(deskripsi).trim();
  }

  const parts: string[] = [];
  if (kategori === "pertanian") {
    if (komoditas) parts.push(`Komoditas: ${komoditas}`);
    if (luas_ha) parts.push(`Luas: ${luas_ha} Ha`);
    if (hasil_panen) parts.push(`Hasil: ${hasil_panen}`);
    if (nama_pemilik) parts.push(`Pemilik: ${nama_pemilik}`);
  } else if (kategori === "umkm") {
    if (jenis_produk) parts.push(`Produk: ${jenis_produk}`);
    if (nama_pemilik) parts.push(`Pemilik: ${nama_pemilik}`);
    if (jam_operasional) parts.push(`Jam: ${jam_operasional}`);
  } else if (kategori === "wisata") {
    if (jam_kunjungan) parts.push(`Jam Kunjungan: ${jam_kunjungan}`);
    if (harga_tiket) parts.push(`Tiket: ${harga_tiket}`);
  } else if (kategori === "infrastruktur") {
    if (jenis_fasilitas) parts.push(`Fasilitas: ${jenis_fasilitas}`);
    if (kondisi) parts.push(`Kondisi: ${kondisi}`);
    if (pengelola) parts.push(`Pengelola: ${pengelola}`);
  }

  if (parts.length > 0) {
    return parts.join(" • ");
  }

  return "Potensi unggulan Desa Rambipuji, Kabupaten Jember.";
}

export default function PotensiCard({ feature }: PotensiCardProps) {
  const { id, nama, nama_usaha, foto, foto_list_urls, kategori } =
    feature.properties;
  const title = nama || nama_usaha || "Tanpa Nama";
  const featureId = id ?? feature.id ?? null;
  const detailHref =
    kategori && featureId ? `/potensi/${kategori}/${featureId}` : null;
  const cardDescription = getCardDescription(feature.properties);

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
        <p
          className="text-sm text-[--text-secondary] line-clamp-2 mt-1 flex-grow"
          title={cardDescription}
        >
          {cardDescription}
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
