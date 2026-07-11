import { ArrowLeft, MapPin, Mountain, Navigation } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import CategoryBadge from "../../../../components/CategoryBadge";
import MiniMap from "../../../../components/MiniMap";
import { getPotensiDetail } from "../../../../lib/api";
import type { KategoriSlug, PotensiFeature } from "../../../../types";

const VALID_KATEGORI: KategoriSlug[] = [
  "pertanian",
  "umkm",
  "wisata",
  "infrastruktur",
];

function getCenterLatLng(geometry: PotensiFeature["geometry"]): [number, number] {
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

export default async function PotensiDetailPage({
  params,
}: {
  params: { kategori: string; id: string };
}) {
  const kategori = params.kategori.toLowerCase() as KategoriSlug;
  if (!VALID_KATEGORI.includes(kategori)) {
    notFound();
  }

  const numericId = Number(params.id);
  if (Number.isNaN(numericId)) {
    notFound();
  }

  let feature: PotensiFeature;
  try {
    feature = await getPotensiDetail(kategori, numericId);
    if (!feature || !feature.properties) {
      notFound();
    }
  } catch {
    notFound();
  }

  const {
    nama,
    nama_usaha,
    foto,
    deskripsi,
    kontak,
    komoditas,
    luas_ha,
    jenis_produk,
    jam_operasional,
    harga_tiket,
    jam_kunjungan,
    jenis_fasilitas,
    kondisi,
  } = feature.properties;

  const title = nama || nama_usaha || "Tanpa Nama";
  const [lat, lng] = getCenterLatLng(feature.geometry);
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const attributes: { label: string; value: string | number }[] = [];
  if (komoditas) attributes.push({ label: "Komoditas", value: komoditas });
  if (luas_ha !== undefined && luas_ha !== null)
    attributes.push({ label: "Luas Lahan", value: `${luas_ha} Ha` });
  if (jenis_produk)
    attributes.push({ label: "Jenis Produk", value: jenis_produk });
  if (jam_operasional)
    attributes.push({ label: "Jam Operasional", value: jam_operasional });
  if (harga_tiket)
    attributes.push({ label: "Harga Tiket", value: harga_tiket });
  if (jam_kunjungan)
    attributes.push({ label: "Jam Kunjungan", value: jam_kunjungan });
  if (jenis_fasilitas)
    attributes.push({ label: "Jenis Fasilitas", value: jenis_fasilitas });
  if (kondisi) attributes.push({ label: "Kondisi", value: kondisi });
  if (kontak) attributes.push({ label: "Kontak", value: kontak });

  return (
    <div className="min-h-screen bg-[--bg-surface] pt-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Breadcrumb & Back Link */}
        <div className="flex items-center justify-between text-sm text-[--text-secondary]">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="hover:text-[--text-primary]">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/potensi" className="hover:text-[--text-primary]">
              Potensi
            </Link>
            <span>/</span>
            <span className="text-[--text-primary] font-medium">{title}</span>
          </nav>

          <Link
            href="/potensi"
            className="inline-flex items-center text-[--color-primary] hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Katalog
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-[--color-neutral-subtle] border border-[--border-default] flex items-center justify-center">
          {foto ? (
            <img
              src={foto}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[--text-muted]">
              <Mountain className="w-12 h-12 mb-2 opacity-60" />
              <span className="text-sm">Foto tidak tersedia</span>
            </div>
          )}
        </div>

        {/* Two-column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column (Main details & attributes) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-2">
              <CategoryBadge kategori={kategori} size="md" />
              <h1 className="text-2xl md:text-3xl font-bold text-[--text-primary]">
                {title}
              </h1>
            </div>

            {deskripsi && (
              <div className="prose max-w-none text-base text-[--text-secondary] leading-relaxed">
                <p>{deskripsi}</p>
              </div>
            )}

            {/* Attribute Table */}
            {attributes.length > 0 && (
              <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden">
                <div className="px-4 py-3 bg-[--bg-surface] border-b border-[--border-default] font-semibold text-sm text-[--text-primary]">
                  Informasi Detail
                </div>
                <div className="divide-y divide-[--border-default]">
                  {attributes.map((attr) => (
                    <div
                      key={attr.label}
                      className="px-4 py-3 flex justify-between text-sm"
                    >
                      <span className="text-[--text-muted] font-medium">
                        {attr.label}
                      </span>
                      <span className="text-[--text-primary] font-semibold">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (MiniMap & Location/Contact action) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-[--border-default] space-y-4">
              <h3 className="font-semibold text-sm text-[--text-primary] flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-[--color-primary]" />
                Lokasi di Peta
              </h3>

              <MiniMap feature={feature} />

              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-sm font-medium rounded-lg transition"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Petunjuk Rute (Google Maps)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
