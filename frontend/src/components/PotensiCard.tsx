import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { PotensiFeature } from "../types";
import CategoryBadge from "./CategoryBadge";
import ImageCarousel from "./ImageCarousel";

export interface PotensiCardProps {
  feature: PotensiFeature;
}

function getCardDescription(properties: Record<string, any>, title: string): string {
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

  const catLabel = kategori ? String(kategori).toLowerCase() : "desa";
  return `${title} merupakan salah satu sektor potensi ${catLabel} yang berada di kawasan Desa Rambipuji, Kabupaten Jember.`;
}

export default function PotensiCard({ feature }: PotensiCardProps) {
  const { id, nama, nama_usaha, foto, foto_list_urls, kategori } =
    feature.properties;
  const title = nama || nama_usaha || "Tanpa Nama";
  const featureId = id ?? feature.id ?? null;
  const detailHref =
    kategori && featureId ? `/potensi/${kategori}/${featureId}` : null;
  const cardDescription = getCardDescription(feature.properties, title);

  // Build images array — prefer foto_list_urls, fall back to single foto
  const images: string[] =
    foto_list_urls && foto_list_urls.length > 0
      ? foto_list_urls
      : foto
      ? [foto]
      : [];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      {/* Photo area — carousel with CategoryBadge overlay and photo gradient */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
        <ImageCarousel
          images={images}
          alt={title}
          autoPlay={false}
          aspectRatio="card"
          zoomOnHover={true}
        />
        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

        {/* CategoryBadge overlaid top-3 left-3 */}
        <div className="absolute top-3 left-3 z-10 shadow-sm backdrop-blur-md">
          <CategoryBadge kategori={kategori} />
        </div>

        {/* Location pill bottom-3 left-3 */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-white text-xs font-medium drop-shadow-md">
          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
          <span>Desa Rambipuji</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {title}
        </h3>
        <p
          className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-2 flex-grow leading-relaxed"
          title={cardDescription}
        >
          {cardDescription}
        </p>

        {/* "Lihat Detail" button */}
        {detailHref && (
          <div className="border-t border-slate-100 mt-4 pt-3.5">
            <Link
              href={detailHref}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-emerald-700 text-slate-700 hover:text-white border border-slate-200/80 hover:border-emerald-700 transition-all duration-200 group/btn"
            >
              <span>Eksplorasi Detail</span>
              <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
