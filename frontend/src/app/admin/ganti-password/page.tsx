"use client";

import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Toast from "../../../components/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { adminChangeOwnPassword } from "../../../lib/api";

export default function GantiPasswordPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!form.current_password)
      errors.current_password = "Password saat ini wajib diisi.";
    if (!form.new_password) errors.new_password = "Password baru wajib diisi.";
    else if (form.new_password.length < 8)
      errors.new_password = "Password baru minimal 8 karakter.";
    if (!form.confirm_new_password)
      errors.confirm_new_password = "Konfirmasi password wajib diisi.";
    else if (form.new_password !== form.confirm_new_password)
      errors.confirm_new_password = "Password tidak cocok.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;
    setLoading(true);
    try {
      await adminChangeOwnPassword(
        form.current_password,
        form.new_password,
        form.confirm_new_password,
        token
      );
      setToastMsg("Password berhasil diubah.");
      setToastType("success");
      setForm({ current_password: "", new_password: "", confirm_new_password: "" });
    } catch (err) {
      setToastMsg(
        err instanceof Error ? err.message : "Gagal mengubah password."
      );
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="bg-white rounded-xl border border-[--border-default] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[--text-primary]">
            Ganti Password
          </h2>
          <p className="text-sm text-[--text-secondary] mt-0.5">
            Perbarui password akun Anda sendiri.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Password Saat Ini <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                autoComplete="current-password"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition pr-10 ${
                  fieldErrors.current_password
                    ? "border-red-400"
                    : "border-[--border-default]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted]"
                tabIndex={-1}
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.current_password && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.current_password}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition pr-10 ${
                  fieldErrors.new_password
                    ? "border-red-400"
                    : "border-[--border-default]"
                }`}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted]"
                tabIndex={-1}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.new_password && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.new_password}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-[--text-primary] mb-1">
              Konfirmasi Password Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm_new_password"
                value={form.confirm_new_password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition pr-10 ${
                  fieldErrors.confirm_new_password
                    ? "border-red-400"
                    : "border-[--border-default]"
                }`}
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted]"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirm_new_password && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.confirm_new_password}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Password"}
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

