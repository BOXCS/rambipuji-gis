"use client";

import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Toast from "../../../../components/Toast";
import { useAuth } from "../../../../hooks/useAuth";
import { adminCreateAccount } from "../../../../lib/api";

type FormState = {
  username: string;
  email: string;
  role: "operator" | "superadmin";
  password: string;
  confirm_password: string;
};

const initialForm: FormState = {
  username: "",
  email: "",
  role: "operator",
  password: "",
  confirm_password: "",
};

export default function TambahAkunPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.username.trim()) errors.username = "Username wajib diisi.";
    if (!form.password) errors.password = "Password wajib diisi.";
    else if (form.password.length < 8)
      errors.password = "Password minimal 8 karakter.";
    if (!form.confirm_password)
      errors.confirm_password = "Konfirmasi password wajib diisi.";
    else if (form.password !== form.confirm_password)
      errors.confirm_password = "Password tidak cocok.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    setLoading(true);
    try {
      await adminCreateAccount(
        {
          username: form.username.trim(),
          email: form.email.trim() || undefined,
          role: form.role,
          password: form.password,
          confirm_password: form.confirm_password,
        },
        token
      );
      showToast("Akun berhasil dibuat.", "success");
      setTimeout(() => router.push("/admin/akun"), 1000);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal membuat akun.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-[--text-secondary]">
          Hanya superadmin yang dapat membuat akun.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/akun"
        className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Akun
      </Link>

      <div className="bg-white rounded-xl border border-[--border-default] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[--text-primary]">
            Tambah Akun Admin
          </h2>
          <p className="text-sm text-[--text-secondary] mt-0.5">
            Buat akun baru untuk mengakses panel admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition ${
                fieldErrors.username
                  ? "border-red-400"
                  : "border-[--border-default]"
              }`}
              placeholder="mis. operator01"
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Email{" "}
              <span className="text-[--text-muted] font-normal">(opsional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[--border-default] text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition"
              placeholder="mis. operator@rambipuji.id"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Peran <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[--border-default] text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition"
            >
              <option value="operator">Operator</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <p className="text-xs text-[--text-muted] mt-1">
              Operator: dapat mengelola data potensi. Superadmin: akses penuh
              termasuk manajemen akun.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition pr-10 ${
                  fieldErrors.password
                    ? "border-red-400"
                    : "border-[--border-default]"
                }`}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition pr-10 ${
                  fieldErrors.confirm_password
                    ? "border-red-400"
                    : "border-[--border-default]"
                }`}
                placeholder="Ulangi password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary]"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirm_password && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/akun"
              className="px-4 py-2 rounded-lg text-sm font-medium text-[--text-secondary] hover:bg-[--bg-surface-raised] transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Akun"}
            </button>
          </div>
        </form>
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg("")}
        />
      )}
    </div>
  );
}

