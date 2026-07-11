"use client";

import { AlertCircle, Image as ImageIcon, Upload, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface PhotoUploadProps {
  value: File | null;
  onChange: (f: File | null) => void;
  existingUrl?: string | null;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function PhotoUpload({
  value,
  onChange,
  existingUrl,
}: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    if (existingUrl) {
      setPreviewUrl(existingUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value, existingUrl]);

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Format file tidak valid. Hanya menerima gambar JPG atau PNG.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Ukuran file melebihi batas maksimal 5MB.");
      return;
    }
    onChange(file);
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

  const handleClear = () => {
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[--text-primary]">
        Foto Potensi
      </label>

      {previewUrl ? (
        <div className="relative w-full h-44 rounded-xl border border-[--border-default] overflow-hidden bg-[--bg-surface-raised]">
          <img
            src={previewUrl}
            alt="Preview foto"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
            title="Hapus foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
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
            Format JPG / PNG, maksimal 5MB
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="flex items-center space-x-1.5 text-red-600 text-xs pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
