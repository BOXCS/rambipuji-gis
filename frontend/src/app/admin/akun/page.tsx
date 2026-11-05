"use client";

import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  User,
  RefreshCw,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Toast from "../../../components/Toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  adminListAccounts,
  adminDeleteAccount,
} from "../../../lib/api";
import type { AdminAccountData } from "../../../types";
import Link from "next/link";

export default function AdminAkunPage() {
  const { token, user } = useAuth();

  const [accounts, setAccounts] = useState<AdminAccountData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [deleteTarget, setDeleteTarget] = useState<AdminAccountData | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const fetchAccounts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminListAccounts(token);
      setAccounts(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat daftar akun.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      await adminDeleteAccount(deleteTarget.id, token);
      showToast("Akun berhasil dihapus.", "success");
      setDeleteTarget(null);
      fetchAccounts();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal menghapus akun.",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (user?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck className="h-12 w-12 text-[--text-muted] mb-4" />
        <h2 className="text-lg font-semibold text-[--text-primary] mb-1">
          Akses Terbatas
        </h2>
        <p className="text-sm text-[--text-secondary]">
          Hanya superadmin yang dapat mengelola akun admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[--text-primary]">
            Manajemen Akun Admin
          </h2>
          <p className="text-sm text-[--text-secondary] mt-0.5">
            Kelola akun admin yang dapat mengakses panel ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAccounts}
            className="p-2 rounded-lg text-[--text-secondary] hover:bg-[--bg-surface-raised] transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/admin/akun/tambah"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Akun
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[--border-default] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[--color-primary]" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <User className="h-10 w-10 text-[--text-muted] mb-3" />
            <p className="text-sm text-[--text-secondary]">
              Belum ada akun admin yang terdaftar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--border-default] bg-[--bg-surface-raised]">
                  <th className="text-left px-5 py-3 font-semibold text-[--text-secondary] w-8">
                    #
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[--text-secondary]">
                    Username
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[--text-secondary]">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[--text-secondary]">
                    Peran
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[--text-secondary]">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[--text-secondary]">
                    Dibuat
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-[--text-secondary]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-default]">
                {accounts.map((acct, idx) => (
                  <tr
                    key={acct.id}
                    className="hover:bg-[--bg-surface-raised] transition"
                  >
                    <td className="px-5 py-3.5 text-[--text-muted]">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[--text-muted] flex-shrink-0" />
                        <span className="font-medium text-[--text-primary]">
                          {acct.username}
                        </span>
                        {acct.id === user?.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[--color-primary-subtle] text-[--color-primary] font-semibold">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[--text-secondary]">
                      {acct.email || (
                        <span className="text-[--text-muted] italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={acct.role} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge isActive={acct.is_active} />
                    </td>
                    <td className="px-5 py-3.5 text-[--text-secondary]">
                      {acct.date_joined
                        ? new Date(acct.date_joined).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/akun/${acct.id}/edit`}
                          className="p-1.5 rounded-lg text-[--text-secondary] hover:bg-blue-50 hover:text-blue-600 transition"
                          title="Edit akun"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={acct.id === user?.id}
                          onClick={() => setDeleteTarget(acct)}
                          className="p-1.5 rounded-lg text-[--text-secondary] hover:bg-red-50 hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            acct.id === user?.id
                              ? "Tidak dapat menghapus akun sendiri"
                              : "Hapus akun"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Akun"
        description={`Apakah Anda yakin ingin menghapus akun "${deleteTarget?.username}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
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

function RoleBadge({ role }: { role: string }) {
  if (role === "superadmin") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[--color-primary-subtle] text-[--color-primary]">
        <ShieldCheck className="h-3 w-3" />
        Superadmin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[--color-neutral-subtle] text-[--color-neutral]">
      <User className="h-3 w-3" />
      Operator
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
        Aktif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
      Nonaktif
    </span>
  );
}
