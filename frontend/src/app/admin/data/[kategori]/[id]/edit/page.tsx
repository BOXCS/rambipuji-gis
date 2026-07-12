"use client";

import { ArrowLeft, Loader2, MapPin, Save, Shapes } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ClientOnly from "../../../../../../components/ClientOnly";
import CoordinatePicker from "../../../../../../components/CoordinatePicker";
import GeometryEditor from "../../../../../../components/GeometryEditor";
import HargaTiketInput from "../../../../../../components/HargaTiketInput";
import JamKunjunganPicker from "../../../../../../components/JamKunjunganPicker";
import JamOperasionalPicker from "../../../../../../components/JamOperasionalPicker";
import PhotoUpload from "../../../../../../components/PhotoUpload";
import Toast from "../../../../../../components/Toast";
import { useAuth } from "../../../../../../hooks/useAuth";
import {
  adminGetPotensiList,
  adminUpdatePotensi,
  getPotensiDetail,
} from "../../../../../../lib/api";
import type { KategoriSlug, PotensiFeature } from "../../../../../../types";

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

function extractCenterCoords(
  geometry: PotensiFeature["geometry"]
): { lat: number; lng: number } {
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    return { lat, lng };
  }
  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] || [];
    if (ring.length === 0) return { lat: -8.25, lng: 113.6 };
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return { lat: sumLat / ring.length, lng: sumLng / ring.length };
  }
  if (geometry.type === "MultiPolygon") {
    const poly = geometry.coordinates[0] || [];
    const ring = poly[0] || [];
    if (ring.length === 0) return { lat: -8.25, lng: 113.6 };
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return { lat: sumLat / ring.length, lng: sumLng / ring.length };
  }
  return { lat: -8.25, lng: 113.6 };
}

export default function AdminEditPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();

  const rawSlug = String(params?.kategori || "").toLowerCase();
  const isValid = VALID_KATEGORI.includes(rawSlug as KategoriSlug);
  const kategori = rawSlug as KategoriSlug;
  const numericId = Number(params?.id);

  const usesGeometryEditor =
    kategori === "pertanian" || kategori === "wisata";

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  // For umkm / infrastruktur — classic point picker
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  // For pertanian / wisata — geometry editor with mode
  const [inputMode, setInputMode] = useState<"point" | "polygon">("point");
  const [geometry, setGeometry] = useState<GeoJSON.Geometry | null>(null);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState<string | null>(null);

  // Common fields
  const [nama, setNama] = useState<string>("");
  const [namaPemilik, setNamaPemilik] = useState<string>("");
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [kontak, setKontak] = useState<string>("");

  // Category specific fields
  const [komoditas, setKomoditas] = useState<string>("");
  const [luasHa, setLuasHa] = useState<string>("");
  const [musimTanam, setMusimTanam] = useState<string>("");

  const [jenisProduk, setJenisProduk] = useState<string>("");
  const [jamOperasional, setJamOperasional] = useState<string>("");

  const [jamKunjungan, setJamKunjungan] = useState<string>("");
  const [hargaTiket, setHargaTiket] = useState<string>("");

  const [jenisFasilitas, setJenisFasilitas] = useState<string>("");
  const [kondisi, setKondisi] = useState<string>("");
  const [kapasitas, setKapasitas] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!isValid || Number.isNaN(numericId)) {
      router.push("/admin/dashboard");
    }
  }, [isValid, numericId, router]);

  useEffect(() => {
    if (!isValid || Number.isNaN(numericId)) return;

    let isMounted = true;
    setInitialLoading(true);

    const loadData = async () => {
      let found: PotensiFeature | null = null;

      if (token) {
        try {
          const col = await adminGetPotensiList(kategori, token);
          found =
            col.features?.find(
              (f) => (f.id ?? f.properties?.id) === numericId
            ) || null;
        } catch {
          // ignore error to try public fallback
        }
      }

      if (!found) {
        try {
          found = await getPotensiDetail(kategori, numericId);
        } catch {
          found = null;
        }
      }

      if (!isMounted) return;

      if (!found || !found.properties) {
        setToastMessage({
          text: "Data tidak ditemukan.",
          type: "error",
        });
        setInitialLoading(false);
        return;
      }

      const p = found.properties;
      setNama(p.nama || p.nama_usaha || "");
      if (p.nama_pemilik) setNamaPemilik(p.nama_pemilik);
      setDeskripsi(p.deskripsi || "");
      setKontak(p.kontak || "");
      setExistingFotoUrl(p.foto || null);

      // Pre-load geometry
      if (usesGeometryEditor && found.geometry) {
        setGeometry(found.geometry);
        if (
          found.geometry.type === "Point"
        ) {
          setInputMode("point");
        } else {
          setInputMode("polygon");
        }
      } else {
        setCoords(extractCenterCoords(found.geometry));
      }

      if (p.komoditas) setKomoditas(p.komoditas);
      if (p.luas_ha !== undefined && p.luas_ha !== null)
        setLuasHa(String(p.luas_ha));
      if (p.musim_tanam) setMusimTanam(p.musim_tanam);

      if (p.jenis_produk) setJenisProduk(p.jenis_produk);
      if (p.jam_operasional) setJamOperasional(p.jam_operasional);

      setJamKunjungan(p.jam_kunjungan || "08:00 - 17:00");
      setHargaTiket(p.harga_tiket || "Gratis");

      if (p.jenis_fasilitas) setJenisFasilitas(p.jenis_fasilitas);
      if (p.kondisi) setKondisi(p.kondisi);
      if (p.kapasitas) setKapasitas(p.kapasitas);

      setInitialLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [kategori, numericId, token, isValid, usesGeometryEditor]);

  if (!isValid || Number.isNaN(numericId)) return null;

  const label = LABEL_MAP[kategori] || kategori;
  const isUMKM = kategori === "umkm";

  const handleSubmit = async () => {
    if (!nama.trim()) {
      setToastMessage({
        text: `${isUMKM ? "Nama Usaha" : "Nama Entri"} wajib diisi.`,
        type: "error",
      });
      return;
    }

    if (usesGeometryEditor) {
      if (!geometry) {
        setToastMessage({
          text: "Lokasi wajib ditentukan di peta.",
          type: "error",
        });
        return;
      }
    } else {
      if (!coords) {
        setToastMessage({
          text: "Koordinat lokasi wajib ditentukan.",
          type: "error",
        });
        return;
      }
    }

    if (!token) return;

    setSaving(true);

    try {
      const formData = new FormData();

      if (isUMKM) {
        formData.set("nama_usaha", nama.trim());
      } else {
        formData.set("nama", nama.trim());
      }

      formData.set("deskripsi", deskripsi.trim());
      formData.set("kontak", kontak.trim());

      // Build geom blob
      let geomPayload: GeoJSON.Geometry;
      if (usesGeometryEditor && geometry) {
        geomPayload = geometry;
      } else if (coords) {
        geomPayload = {
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        };
      } else {
        throw new Error("Lokasi belum ditentukan.");
      }

      formData.set("geom", JSON.stringify(geomPayload));

      if (fotoFile) {
        formData.set("foto", fotoFile);
      }

      if (kategori === "pertanian") {
        if (namaPemilik.trim()) {
          formData.set("nama_pemilik", namaPemilik.trim());
        }
        formData.set("komoditas", komoditas.trim());
        if (luasHa.trim()) {
          formData.set("luas_ha", luasHa.trim());
        }
        formData.set("musim_tanam", musimTanam.trim());
      } else if (kategori === "umkm") {
        if (namaPemilik.trim()) {
          formData.set("nama_pemilik", namaPemilik.trim());
        }
        formData.set("jenis_produk", jenisProduk.trim());
        formData.set("jam_operasional", jamOperasional.trim());
      } else if (kategori === "wisata") {
        formData.set("jam_kunjungan", jamKunjungan.trim());
        formData.set("harga_tiket", hargaTiket.trim());
      } else if (kategori === "infrastruktur") {
        formData.set("jenis_fasilitas", jenisFasilitas.trim());
        formData.set("kondisi", kondisi.trim());
        formData.set("kapasitas", kapasitas.trim());
      }

      await adminUpdatePotensi(kategori, numericId, formData, token);

      router.push(`/admin/data/${kategori}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui entri data.";
      setToastMessage({
        text: msg,
        type: "error",
      });
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[--text-muted] text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[--color-primary]" />
        Memuat data untuk diedit...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/data/${kategori}`}
            className="inline-flex items-center text-xs text-[--text-secondary] hover:text-[--color-primary] mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Kembali ke Daftar {label}
          </Link>
          <h2 className="text-xl font-bold text-[--text-primary]">
            Edit {label} #{numericId}
          </h2>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Map Picker or Geometry Editor */}
        <div className="bg-white p-5 rounded-xl border border-[--border-default] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[--text-primary]">
              {usesGeometryEditor
                ? "Edit Lokasi di Peta"
                : "Perbarui Koordinat Spasial"}
            </span>
            {!usesGeometryEditor && (
              <span className="text-xs text-[--text-secondary]">
                Geser penanda jika perlu mengubah lokasi
              </span>
            )}
          </div>

          {/* Mode selector — only for pertanian and wisata */}
          {usesGeometryEditor && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputMode("point");
                  setGeometry(null);
                }}
                className={
                  inputMode === "point"
                    ? "px-3 py-1.5 rounded-lg text-sm font-medium bg-[--color-primary] text-white"
                    : "px-3 py-1.5 rounded-lg text-sm font-medium border border-[--border-default] text-[--text-secondary]"
                }
              >
                <MapPin className="h-4 w-4 inline mr-1" />
                Titik
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode("polygon");
                  setGeometry(null);
                }}
                className={
                  inputMode === "polygon"
                    ? "px-3 py-1.5 rounded-lg text-sm font-medium bg-[--color-primary] text-white"
                    : "px-3 py-1.5 rounded-lg text-sm font-medium border border-[--border-default] text-[--text-secondary]"
                }
              >
                <Shapes className="h-4 w-4 inline mr-1" />
                Area / Polygon
              </button>
            </div>
          )}

          <div suppressHydrationWarning className="rounded-xl overflow-hidden">
            <ClientOnly
              fallback={
                <div className="h-[500px] bg-[--bg-surface-raised] rounded-xl flex items-center justify-center text-[--text-muted] text-sm">
                  Memuat editor peta...
                </div>
              }
            >
              {usesGeometryEditor ? (
                <GeometryEditor
                  kategori={kategori}
                  value={geometry}
                  onChange={setGeometry}
                  mode={inputMode}
                />
              ) : (
                <CoordinatePicker value={coords} onChange={setCoords} />
              )}
            </ClientOnly>
          </div>
        </div>

        {/* Right Column: Scrollable Form */}
        <div className="bg-white p-6 rounded-xl border border-[--border-default] space-y-5">
          <h3 className="text-sm font-bold text-[--text-primary] border-b border-[--border-default] pb-2">
            Atribut &amp; Informasi {label}
          </h3>

          <div className="space-y-4">
            {/* Nama / Nama Usaha */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[--text-primary]">
                {isUMKM ? "Nama Usaha / Toko *" : "Nama Entri / Lokasi *"}
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
              />
            </div>

            {/* nama_pemilik — shown for umkm and pertanian */}
            {(kategori === "umkm" || kategori === "pertanian") && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[--text-primary]">
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  value={namaPemilik}
                  onChange={(e) => setNamaPemilik(e.target.value)}
                  placeholder="Nama pemilik usaha / lahan"
                  className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                />
              </div>
            )}

            {/* Read-only Koordinat — only for point-only categories */}
            {!usesGeometryEditor && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[--text-primary]">
                  Koordinat Lokasi (Lat, Lng) *
                </label>
                <input
                  type="text"
                  readOnly
                  value={
                    coords
                      ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                      : "-"
                  }
                  className="w-full px-3 py-2 text-xs font-mono bg-gray-100 text-[--text-secondary] border border-[--border-default] rounded-lg cursor-not-allowed"
                />
              </div>
            )}

            {/* Category-Specific Fields */}
            {kategori === "pertanian" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[--text-primary]">
                      Komoditas Utama
                    </label>
                    <input
                      type="text"
                      value={komoditas}
                      onChange={(e) => setKomoditas(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[--text-primary]">
                      Luas Lahan (Ha)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={luasHa}
                      onChange={(e) => setLuasHa(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[--text-primary]">
                    Musim Tanam
                  </label>
                  <input
                    type="text"
                    value={musimTanam}
                    onChange={(e) => setMusimTanam(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                  />
                </div>
              </>
            )}

            {kategori === "umkm" && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[--text-primary]">
                    Jenis Produk
                  </label>
                  <input
                    type="text"
                    value={jenisProduk}
                    onChange={(e) => setJenisProduk(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                  />
                </div>
                <JamOperasionalPicker
                  value={jamOperasional || "08:00 - 17:00"}
                  onChange={(v) => setJamOperasional(v)}
                />
              </>
            )}

            {kategori === "wisata" && (
              <>
                <JamKunjunganPicker
                  value={jamKunjungan || "08:00 - 17:00"}
                  onChange={(v) => setJamKunjungan(v)}
                />
                <HargaTiketInput
                  value={hargaTiket || "Gratis"}
                  onChange={(v) => setHargaTiket(v)}
                />
              </>
            )}

            {kategori === "infrastruktur" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[--text-primary]">
                      Jenis Fasilitas
                    </label>
                    <input
                      type="text"
                      value={jenisFasilitas}
                      onChange={(e) => setJenisFasilitas(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[--text-primary]">
                      Kondisi
                    </label>
                    <input
                      type="text"
                      value={kondisi}
                      onChange={(e) => setKondisi(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[--text-primary]">
                    Kapasitas / Ukuran
                  </label>
                  <input
                    type="text"
                    value={kapasitas}
                    onChange={(e) => setKapasitas(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
                  />
                </div>
              </>
            )}

            {/* Deskripsi */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[--text-primary]">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
              />
            </div>

            {/* Kontak */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[--text-primary]">
                Kontak / Nomor Telepon
              </label>
              <input
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
              />
            </div>

            {/* PhotoUpload */}
            <PhotoUpload
              value={fotoFile}
              onChange={setFotoFile}
              existingUrl={existingFotoUrl}
            />
          </div>

          <div className="pt-3 border-t border-[--border-default] flex items-center justify-end space-x-3">
            <Link
              href={`/admin/data/${kategori}`}
              className="px-4 py-2.5 text-xs font-medium text-[--text-secondary] hover:bg-[--color-neutral-subtle] rounded-lg transition"
            >
              Batal
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2.5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-70 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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
