"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import React, { useEffect } from "react";

export interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-floating text-white text-xs font-semibold ${
        isSuccess ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:opacity-80 transition"
        title="Tutup"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
