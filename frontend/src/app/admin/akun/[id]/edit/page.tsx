"use client";

import { ArrowLeft, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Toast from "../../../../../components/Toast";
import { useAuth } from "../../../../../hooks/useAuth";
import { adminGetAccount, adminUpdateAccount } from "../../../../../lib/api";
import type { AdminAccountData } from "../../../../../types";

type FormState = {
  username: string;
  email: string;
  role: "operator" | "superadmin";
  is_active: boolean;
  new_password: string;
  confirm_new_password: string;
};

export default function EditAkunPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [account, setAccount] = useState<AdminAccountData | null>(null);
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    role: "operator",
    is_active: true,
    new_password: "",
    confirm_new_password: "",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (!token || !id) return;
    setLoadingData(true);
    adminGetAccount(id, token)
      .then((data) => {
        setAccount(data);
        setForm({
          username: data.username,
          email: data.email || "",
          role: data.role,
          is_active: data.is_active,
          new_password: "",
          confirm_new_password: "",
        });
      })
      .catch((err) => {
        showToast(
          err instanceof Error ? err.message : "Gagal memuat akun.",
          "error"
        );
      })
      .finally(() => setLoadingData(false));
  }, [token, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
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
    if (form.new_password) {
      if (form.new_password.length < 8)
        errors.new_password = "Password baru minimal 8 karakter.";
      if (form.new_password !== form.confirm_new_password)
        errors.confirm_new_password = "Konfirmasi password tidak cocok.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    setSaving(true);
    try {
      await adminUpdateAccount(
        id,
        {
          username: form.username.trim(),
          email: form.email.trim() || undefined,
          role: form.role,
          is_active: form.is_active,
          new_password: form.new_password || undefined,
          confirm_new_password: form.confirm_new_password || undefined,
        },
        token
      );
      showToast("Akun berhasil diperbarui.", "success");
      setTimeout(() => router.push("/admin/akun"), 1000);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memperbarui akun.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-[--text-secondary]">
          Hanya superadmin yang dapat mengedit akun.
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
            Edit Akun Admin
          </h2>
          {account && (
            <p className="text-sm text-[--text-secondary] mt-0.5">
              Mengedit akun:{" "}
              <span className="font-medium text-[--text-primary]">
                {account.username}
              </span>
            </p>
          )}
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[--color-primary]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Self-edit warning */}
            {account?.id === user?.id && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Anda sedang mengedit akun Anda sendiri. Perubahan peran atau
                  status tidak akan diterapkan ke sesi aktif.
                </span>
              </div>
            )}

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
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition ${
                  fieldErrors.username
                    ? "border-red-400"
                    : "border-[--border-default]"
                }`}
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[--text-primary] mb-1">
                Email{" "}
                <span className="text-[--text-muted] font-normal">
                  (opsional)
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[--border-default] text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] transition"
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
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[--text-primary] mb-2">
                Status Akun
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 rounded-full bg-[--border-strong] peer-checked:bg-[--color-primary] transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm text-[--text-secondary]">
                  {form.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </label>
            </div>

            {/* Divider */}
            <div className="border-t border-[--border-default] pt-4">
              <p className="text-sm font-medium text-[--text-primary] mb-1">
                Ubah Password{" "}
                <span className="text-[--text-muted] font-normal">
                  (kosongkan jika tidak ingin mengubah)
                </span>
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[--text-primary] mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
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
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary]"
                  tabIndex={-1}
                >
                  {showNewPwd ? (
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
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
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
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-secondary]"
                  tabIndex={-1}
                >
                  {showConfirmPwd ? (
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
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
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

