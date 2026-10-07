"use client";

/**
 * Admin: Profil Desa editor page
 *
 * Allows village staff to update all village profile fields including:
 * - Identity (nama, kecamatan, kabupaten, dll.)
 * - Demographics (jumlah_penduduk, luas_wilayah, dll.)
 * - Vision & Mission
 * - About text (sejarah, deskripsi)
 * - Contact & opening hours
 * - Hero photo
 */

import {
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import NextImage from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { adminGetDesaProfile, adminUpdateDesaProfile } from "../../../lib/api";
import type { DesaProfile } from "../../../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

interface Toast {
  type: "success" | "error";
  message: string;
}

interface FormState {
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  jumlah_penduduk: string;
  jumlah_penduduk_laki: string;
  jumlah_penduduk_perempuan: string;
  jumlah_kk: string;
  luas_wilayah_ha: string;
  jumlah_dusun: string;
  jumlah_rw: string;
  jumlah_rt: string;
  visi: string;
  misi: string[]; // array of mission items
  sejarah: string;
  deskripsi: string;
  alamat_kantor: string;
  telepon: string;
  email: string;
  website: string;
  jam_pelayanan: string;
}

const DEFAULT_FORM: FormState = {
  nama_desa: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
  jumlah_penduduk: "0",
  jumlah_penduduk_laki: "0",
  jumlah_penduduk_perempuan: "0",
  jumlah_kk: "0",
  luas_wilayah_ha: "0",
  jumlah_dusun: "0",
  jumlah_rw: "0",
  jumlah_rt: "0",
  visi: "",
  misi: [""],
  sejarah: "",
  deskripsi: "",
  alamat_kantor: "",
  telepon: "",
  email: "",
  website: "",
  jam_pelayanan: "",
};

function profileToForm(p: DesaProfile): FormState {
  let misiList: string[] = [];

  if (Array.isArray(p.misi)) {
    p.misi.forEach((item) => {
      if (typeof item === "string" && item.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) {
            misiList.push(...parsed.map(String));
            return;
          }
        } catch {
          // ignore parse error
        }
      }
      misiList.push(String(item));
    });
  } else if (typeof p.misi === "string") {
    try {
      const parsed = JSON.parse(p.misi);
      if (Array.isArray(parsed)) {
        misiList = parsed.map(String);
      } else {
        misiList = [p.misi];
      }
    } catch {
      misiList = [p.misi];
    }
  }

  if (misiList.length === 0) {
    misiList = [""];
  }

  return {
    nama_desa: p.nama_desa ?? "",
    kecamatan: p.kecamatan ?? "",
    kabupaten: p.kabupaten ?? "",
    provinsi: p.provinsi ?? "",
    kode_pos: p.kode_pos ?? "",
    jumlah_penduduk: String(p.jumlah_penduduk ?? 0),
    jumlah_penduduk_laki: String(p.jumlah_penduduk_laki ?? 0),
    jumlah_penduduk_perempuan: String(p.jumlah_penduduk_perempuan ?? 0),
    jumlah_kk: String(p.jumlah_kk ?? 0),
    luas_wilayah_ha: String(p.luas_wilayah_ha ?? 0),
    jumlah_dusun: String(p.jumlah_dusun ?? 0),
    jumlah_rw: String(p.jumlah_rw ?? 0),
    jumlah_rt: String(p.jumlah_rt ?? 0),
    visi: p.visi ?? "",
    misi: misiList,
    sejarah: p.sejarah ?? "",
    deskripsi: p.deskripsi ?? "",
    alamat_kantor: p.alamat_kantor ?? p.kontak?.alamat ?? "",
    telepon: p.telepon ?? p.kontak?.telepon ?? "",
    email: p.email ?? p.kontak?.email ?? "",
    website: p.website ?? "",
    jam_pelayanan: p.jam_pelayanan ?? p.kontak?.jam ?? "",
  };
}

// ─── Bullet Textarea Helper ──────────────────────────────────────────────────

function BulletTextarea({
  id,
  name,
  label,
  value,
  rows,
  onChange,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  rows: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    const lastNewlineBeforeCursor = val.lastIndexOf("\n", start - 1);
    const currentLineStart = lastNewlineBeforeCursor === -1 ? 0 : lastNewlineBeforeCursor + 1;
    const currentLine = val.substring(currentLineStart, start);

    const bulletMatch = currentLine.match(/^(\s*[-•*]\s*)/);

    if (bulletMatch) {
      e.preventDefault();
      const prefix = bulletMatch[1];
      const textAfterPrefix = currentLine.substring(prefix.length).trim();

      if (textAfterPrefix === "") {
        // Empty bullet line — remove bullet prefix from current line
        const newVal = val.substring(0, currentLineStart) + val.substring(start);
        const event = {
          target: { name, value: newVal },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = currentLineStart;
            textareaRef.current.selectionEnd = currentLineStart;
          }
        }, 0);
      } else {
        // Non-empty bullet line — auto insert bullet on next line
        const bulletToInsert = `\n${prefix.includes("•") ? "• " : prefix.includes("*") ? "* " : "- "}`;
        const newVal = val.substring(0, start) + bulletToInsert + val.substring(end);
        const event = {
          target: { name, value: newVal },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = start + bulletToInsert.length;
            textareaRef.current.selectionStart = newPos;
            textareaRef.current.selectionEnd = newPos;
          }
        }, 0);
      }
    }
  };

  const handleInsertBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const val = textarea.value;
    const lastNewlineBeforeCursor = val.lastIndexOf("\n", start - 1);
    const currentLineStart = lastNewlineBeforeCursor === -1 ? 0 : lastNewlineBeforeCursor + 1;
    const currentLine = val.substring(currentLineStart);

    let newVal: string;
    let newCursorPos: number;

    if (/^\s*[-•*]\s*/.test(currentLine)) {
      newVal = val.substring(0, currentLineStart) + currentLine.replace(/^\s*[-•*]\s*/, "");
      newCursorPos = Math.max(currentLineStart, start - 2);
    } else {
      const prefix = "- ";
      newVal = val.substring(0, currentLineStart) + prefix + val.substring(currentLineStart);
      newCursorPos = start + prefix.length;
    }

    const event = {
      target: { name, value: newVal },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
      }
    }, 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-[--text-secondary]">
          {label}
        </label>
        <button
          type="button"
          onClick={handleInsertBullet}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-[--color-primary-subtle] text-[--color-primary] hover:bg-[--color-primary] hover:text-white transition-colors"
          title="Klik untuk membuat poin / bullet list"
        >
          <span>• Tambah Poin (-)</span>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={`${inputCls} font-sans leading-relaxed`}
        placeholder={placeholder}
      />
      <p className="text-[11px] text-[--text-muted] mt-1">
        Tips: Ketik <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">- </code> lalu tekan Enter untuk membuat baris poin otomatis.
      </p>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[--border-default] shadow-sm p-6 mb-6">
      <h2 className="text-base font-semibold text-[--text-primary] mb-4 pb-3 border-b border-[--border-default]">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Input + Textarea helpers ─────────────────────────────────────────────────

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-[--text-secondary] mb-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent transition";

// ─── Main component ──────────────────────────────────────────────────────────

export default function AdminTentangPage() {
  const { token } = useAuth();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [fotoHeroPreview, setFotoHeroPreview] = useState<string | null>(null);
  const [fotoHeroFile, setFotoHeroFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load existing profile ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminGetDesaProfile(token)
      .then((profile) => {
        setForm(profileToForm(profile));
        if (profile.foto_hero_url) {
          setFotoHeroPreview(profile.foto_hero_url);
        }
      })
      .catch(() => {
        showToast("error", "Gagal memuat profil desa.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // ── Toast helper ────────────────────────────────────────────────────────
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  // ── Form field change ───────────────────────────────────────────────────
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Misi list management ────────────────────────────────────────────────
  const handleMisiChange = (idx: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.misi];
      next[idx] = value;
      return { ...prev, misi: next };
    });
  };

  const handleAddMisi = () => {
    setForm((prev) => ({ ...prev, misi: [...prev.misi, ""] }));
  };

  const handleRemoveMisi = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      misi: prev.misi.filter((_, i) => i !== idx),
    }));
  };

  // ── Photo selection ─────────────────────────────────────────────────────
  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoHeroFile(file);
    setFotoHeroPreview(URL.createObjectURL(file));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    const fd = new FormData();

    // Append all text fields
    (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
      if (key === "misi") {
        const activeMisi = form.misi.filter((m) => m.trim());
        if (activeMisi.length === 0) {
          fd.append("misi", "");
        } else {
          activeMisi.forEach((m) => fd.append("misi", m));
        }
      } else {
        fd.append(key, form[key] as string);
      }
    });

    if (fotoHeroFile) {
      fd.append("foto_hero", fotoHeroFile);
    }

    try {
      await adminUpdateDesaProfile(fd, token);
      showToast("success", "Profil desa berhasil disimpan!");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Gagal menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl border border-[--border-default] p-6 h-40"
          >
            <div className="w-1/3 h-4 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-8 bg-gray-100 rounded" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Toast notification ────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-0">
        {/* ── Section 1: Identitas Desa ─────────────────────────────────── */}
        <Section title="Identitas Desa">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Desa" id="nama_desa">
              <input
                id="nama_desa"
                name="nama_desa"
                value={form.nama_desa}
                onChange={handleChange}
                className={inputCls}
                placeholder="Rambipuji"
              />
            </Field>
            <Field label="Kecamatan" id="kecamatan">
              <input
                id="kecamatan"
                name="kecamatan"
                value={form.kecamatan}
                onChange={handleChange}
                className={inputCls}
                placeholder="Rambipuji"
              />
            </Field>
            <Field label="Kabupaten" id="kabupaten">
              <input
                id="kabupaten"
                name="kabupaten"
                value={form.kabupaten}
                onChange={handleChange}
                className={inputCls}
                placeholder="Jember"
              />
            </Field>
            <Field label="Provinsi" id="provinsi">
              <input
                id="provinsi"
                name="provinsi"
                value={form.provinsi}
                onChange={handleChange}
                className={inputCls}
                placeholder="Jawa Timur"
              />
            </Field>
            <Field label="Kode Pos" id="kode_pos">
              <input
                id="kode_pos"
                name="kode_pos"
                value={form.kode_pos}
                onChange={handleChange}
                className={inputCls}
                placeholder="68152"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 2: Statistik Desa ─────────────────────────────────── */}
        <Section title="Statistik Desa">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "jumlah_penduduk", label: "Jumlah Penduduk" },
              { name: "jumlah_penduduk_laki", label: "Penduduk Laki-laki" },
              {
                name: "jumlah_penduduk_perempuan",
                label: "Penduduk Perempuan",
              },
              { name: "jumlah_kk", label: "Jumlah KK" },
              { name: "luas_wilayah_ha", label: "Luas Wilayah (Ha)" },
              { name: "jumlah_dusun", label: "Jumlah Dusun" },
              { name: "jumlah_rw", label: "Jumlah RW" },
              { name: "jumlah_rt", label: "Jumlah RT" },
            ].map(({ name, label }) => (
              <Field key={name} label={label} id={name}>
                <input
                  id={name}
                  name={name}
                  type="number"
                  min="0"
                  step={name === "luas_wilayah_ha" ? "any" : "1"}
                  value={form[name as keyof FormState] as string}
                  onChange={handleChange}
                  className={inputCls}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* ── Section 3: Visi & Misi ────────────────────────────────────── */}
        <Section title="Visi & Misi">
          <Field label="Visi" id="visi">
            <textarea
              id="visi"
              name="visi"
              rows={3}
              value={form.visi}
              onChange={handleChange}
              className={inputCls}
              placeholder="Terwujudnya Desa Rambipuji yang..."
            />
          </Field>

          <div className="mt-4">
            <p className="text-xs font-medium text-[--text-secondary] mb-2">
              Misi
            </p>
            <div className="space-y-2">
              {form.misi.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="w-6 h-6 flex-shrink-0 rounded-full bg-[--color-primary-subtle] text-[--color-primary] text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <input
                    id={`misi-${idx}`}
                    value={item}
                    onChange={(e) => handleMisiChange(idx, e.target.value)}
                    className={`${inputCls} flex-1`}
                    placeholder={`Misi ke-${idx + 1}`}
                  />
                  {form.misi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMisi(idx)}
                      className="p-1.5 text-[--text-muted] hover:text-red-600 transition-colors rounded"
                      aria-label="Hapus misi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddMisi}
              id="btn-tambah-misi"
              className="mt-3 flex items-center gap-1.5 text-xs text-[--color-primary] hover:text-[--color-primary-hover] font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Misi
            </button>
          </div>
        </Section>

        {/* ── Section 4: Tentang Desa ───────────────────────────────────── */}
        <Section title="Tentang Desa">
          <div className="space-y-6">
            <BulletTextarea
              id="deskripsi"
              name="deskripsi"
              label="Deskripsi Singkat (tampil di hero halaman Tentang)"
              rows={3}
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Ketik deskripsi singkat desa... Gunakan '-' untuk baris poin otomatis."
            />
            <BulletTextarea
              id="sejarah"
              name="sejarah"
              label="Sejarah Desa (tampil di bagian Tentang)"
              rows={6}
              value={form.sejarah}
              onChange={handleChange}
              placeholder="Ketik sejarah & profil desa... Gunakan '-' untuk baris poin otomatis."
            />
          </div>
        </Section>

        {/* ── Section 5: Kontak & Jam Pelayanan ───────────────────────── */}
        <Section title="Kontak & Jam Pelayanan">
          <div className="space-y-4">
            <Field label="Alamat Kantor" id="alamat_kantor">
              <textarea
                id="alamat_kantor"
                name="alamat_kantor"
                rows={2}
                value={form.alamat_kantor}
                onChange={handleChange}
                className={inputCls}
                placeholder="Jl. Rambipuji No. 1..."
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Telepon" id="telepon">
                <input
                  id="telepon"
                  name="telepon"
                  type="tel"
                  value={form.telepon}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="(0331) 711234"
                />
              </Field>
              <Field label="Email" id="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="desa@rambipuji.desa.id"
                />
              </Field>
              <Field label="Website" id="website">
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="https://rambipuji.desa.id"
                />
              </Field>
              <Field label="Jam Pelayanan" id="jam_pelayanan">
                <input
                  id="jam_pelayanan"
                  name="jam_pelayanan"
                  value={form.jam_pelayanan}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Senin-Jumat: 08.00-16.00 WIB"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Section 6: Foto Hero ──────────────────────────────────────── */}
        <Section title="Foto Hero Halaman Tentang">
          <div className="space-y-4">
            {fotoHeroPreview && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[--border-default]">
                <NextImage
                  src={fotoHeroPreview}
                  alt="Preview foto hero"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              </div>
            )}
            <button
              type="button"
              id="btn-upload-foto-hero"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[--border-default] text-sm text-[--text-secondary] hover:bg-[--bg-surface-raised] transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              {fotoHeroFile
                ? fotoHeroFile.name
                : fotoHeroPreview
                ? "Ganti Foto Hero"
                : "Upload Foto Hero"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFotoChange}
            />
            <p className="text-xs text-[--text-muted]">
              Format: JPEG, PNG, WebP. Maks. 5 MB. Rasio 16:9 disarankan.
            </p>
          </div>
        </Section>

        {/* ── Submit button ─────────────────────────────────────────────── */}
        <button
          id="btn-simpan-profil-desa"
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </form>
    </div>
  );
}
