"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { adminImportShapefile } from "../../../lib/api";
import type { KategoriSlug } from "../../../types";

const MAX_ZIP_BYTES = 50 * 1024 * 1024; // 50MB

export default function AdminImportPage() {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [kategori, setKategori] = useState<KategoriSlug>("pertanian");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    count: number;
    filename: string;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateAndSetFile = (f: File) => {
    setFileError(null);
    setSuccessResult(null);
    setApiError(null);

    if (!f.name.toLowerCase().endsWith(".zip")) {
      setFileError("Format file tidak valid. Hanya menerima arsip ZIP (.zip).");
      return;
    }
    if (f.size > MAX_ZIP_BYTES) {
      setFileError("Ukuran file melebihi batas maksimal 50MB.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFileError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!file) {
      setFileError("Silakan pilih file ZIP terlebih dahulu.");
      return;
    }

    if (!token) return;

    setLoading(true);
    setSuccessResult(null);
    setApiError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kategori", kategori);

      const res = await adminImportShapefile(formData, token);
      const count = typeof res.imported === "number" ? res.imported : 1;

      setSuccessResult({
        count,
        filename: res.filename || file.name,
      });
      setFile(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memproses import shapefile.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-[--text-primary]">
          Import Data Shapefile (.shp)
        </h2>
        <p className="text-xs text-[--text-secondary]">
          Unggah arsip Shapefile untuk memasukkan fitur spasial secara massal
          ke dalam basis data PostGIS.
        </p>
      </div>

      {/* Explanation Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Panduan & Syarat File Import</span>
        </div>

        <ul className="list-disc list-inside text-xs text-blue-900 space-y-1.5 leading-relaxed">
          <li>
            File harus dalam format arsip kompresi <b>.zip</b>.
          </li>
          <li>
            Arsip wajib mengandung minimal 3 komponen utama Shapefile:{" "}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">
              .shp
            </code>
            ,{" "}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">
              .dbf
            </code>
            , dan{" "}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">
              .shx
            </code>
            .
          </li>
          <li>
            Sistem koordinat referensi (CRS) yang didukung adalah{" "}
            <b>EPSG:4326 (WGS 84 Lat/Lng)</b> atau{" "}
            <b>EPSG:32750 (UTM Zone 50S)</b>.
          </li>
          <li>Ukuran maksimal arsip uncompressed tidak melebihi 50MB.</li>
        </ul>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-xl border border-[--border-default] space-y-6">
        {/* Kategori Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="kategori-select"
            className="block text-xs font-semibold text-[--text-primary]"
          >
            Pilih Kategori Lapisan Tujuan
          </label>
          <select
            id="kategori-select"
            value={kategori}
            onChange={(e) => setKategori(e.target.value as KategoriSlug)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary] text-[--text-primary] disabled:bg-gray-100 transition"
          >
            <option value="pertanian">Pertanian & Perkebunan</option>
            <option value="umkm">UMKM & Usaha Warga</option>
            <option value="wisata">Wisata & Budaya</option>
            <option value="infrastruktur">Infrastruktur</option>
            <option value="batas-wilayah">Batas Wilayah Administrasi</option>
          </select>
        </div>

        {/* File Upload Area */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[--text-primary]">
            Arsip Shapefile (.zip)
          </label>

          {file ? (
            <div className="relative w-full p-4 rounded-xl border border-[--border-default] bg-[--bg-surface-raised] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[--color-primary-subtle] flex items-center justify-center text-[--color-primary]">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[--text-primary]">
                    {file.name}
                  </div>
                  <div className="text-xs text-[--text-secondary]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                disabled={loading}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-[--text-secondary] transition"
                title="Hapus file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !loading && inputRef.current?.click()}
              className="w-full h-44 border-2 border-dashed border-[--border-default] hover:border-[--color-primary] rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer bg-white hover:bg-[--bg-surface] transition"
            >
              <div className="w-10 h-10 rounded-full bg-[--color-primary-subtle] flex items-center justify-center text-[--color-primary] mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[--text-primary]">
                Klik atau seret file ZIP ke sini
              </span>
              <span className="text-[11px] text-[--text-muted] mt-1">
                Format arsip .zip (maks. 50MB)
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
          />

          {fileError && (
            <div className="flex items-center space-x-1.5 text-red-600 text-xs pt-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !file}
            className="w-full py-3 px-4 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sedang mengimpor shapefile ke PostGIS...</span>
              </>
            ) : (
              <span>Upload & Import ke PostGIS</span>
            )}
          </button>
        </div>
      </div>

      {/* Success Card */}
      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start space-x-3.5">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">
              Import Berhasil
            </h4>
            <p className="text-xs text-emerald-800">
              Berhasil mengimpor <b>{successResult.count} fitur spasial</b> dari
              file <b>{successResult.filename}</b> ke tabel kategori yang
              dipilih.
            </p>
          </div>
        </div>
      )}

      {/* Error Card */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start space-x-3.5">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-900">
              Gagal Mengimpor Shapefile
            </h4>
            <p className="text-xs text-red-800">{apiError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
