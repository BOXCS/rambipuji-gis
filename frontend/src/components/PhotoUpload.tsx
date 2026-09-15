"use client";

import { AlertCircle, ImageIcon, Plus, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

export interface PhotoUploadProps {
  /** New files chosen by the user in this session */
  value: File[];
  /** Existing photo URLs (edit page) — shown as thumbnails before new files */
  existingUrls?: string[];
  onChange: (files: File[]) => void;
  /** Called when an existing photo URL should be removed */
  onRemoveExisting?: (url: string) => void;
}

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (compressed server-side)

function validateFile(file: File): string | null {
  if (
    file.type !== "image/jpeg" &&
    file.type !== "image/png" &&
    file.type !== "image/webp"
  ) {
    return `Format tidak valid: ${file.name}. Hanya JPG/PNG/WebP.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File terlalu besar: ${file.name}. Maks 10MB.`;
  }
  return null;
}

export default function PhotoUpload({
  value,
  existingUrls = [],
  onChange,
  onRemoveExisting,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalCount = existingUrls.length + value.length;
  const hasAny = totalCount > 0;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setError(null);

    const candidates = Array.from(incoming);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of candidates) {
      const err = validateFile(file);
      if (err) {
        errors.push(err);
      } else {
        valid.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(" · "));
      return;
    }

    const next = [...value, ...valid];
    if (next.length + existingUrls.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} foto. Hapus beberapa foto terlebih dahulu.`);
      return;
    }
    onChange(next);
  };

  const removeNewFile = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset input value so the same file can be re-selected after removal
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[--text-primary]">
        Foto Potensi
      </label>

      {hasAny ? (
        <>
          {/* Thumbnail grid */}
          <div className="grid grid-cols-3 gap-2 mt-1">
            {/* Existing URL thumbnails */}
            {existingUrls.map((url, i) => (
              <div
                key={`existing-${i}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-[--border-default] bg-[--bg-surface-raised]"
              >
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/50 text-white py-0.5">
                    Utama
                  </span>
                )}
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(url)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition"
                    title="Hapus foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* New file thumbnails */}
            {value.map((file, i) => {
              const objectUrl = URL.createObjectURL(file);
              const globalIndex = existingUrls.length + i;
              return (
                <div
                  key={`new-${i}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-[--border-default] bg-[--bg-surface-raised]"
                >
                  <img
                    src={objectUrl}
                    alt={`Foto baru ${i + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(objectUrl)}
                  />
                  {globalIndex === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/50 text-white py-0.5">
                      Utama
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition"
                    title="Hapus foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* "Tambah foto lagi" cell — only shown when below max */}
            {totalCount < MAX_FILES && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-[--border-default] hover:border-[--color-primary] flex flex-col items-center justify-center gap-1 text-[--text-muted] hover:text-[--color-primary] transition cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-medium">Tambah</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-[--text-muted]">
            Foto 1 akan menjadi foto utama. Format JPG/PNG/WebP, maks 10MB per foto.
            Gambar akan dioptimasi otomatis.
          </p>
        </>
      ) : (
        /* Empty — drag & drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="w-full h-44 border-2 border-dashed border-[--border-default] hover:border-[--color-primary] rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer bg-white hover:bg-[--bg-surface] transition"
        >
          <div className="w-10 h-10 rounded-full bg-[--color-primary-subtle] flex items-center justify-center text-[--color-primary] mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[--text-primary]">
            Klik atau seret foto ke sini
          </span>
          <span className="text-[11px] text-[--text-muted] mt-1">
            Format JPG / PNG / WebP, maks 10MB, hingga {MAX_FILES} foto.
            Gambar akan dioptimasi otomatis.
          </span>
        </div>
      )}

      {/* Hidden file input — multiple */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="flex items-start gap-1.5 text-red-600 text-xs pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
