"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

export default function Footer() {
  const pathname = usePathname() || "";
  const isPetaRoute = pathname === "/peta" || pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <footer className="w-full py-4 px-6 border-t border-[--border-default] bg-white text-xs text-[--text-secondary] flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-kabupaten-jember.png"
            alt="Logo Kabupaten Jember"
            width={18}
            height={18}
            className="w-4 h-4 object-contain"
          />
          <span className="font-medium text-[--text-primary]">WebGIS Desa Rambipuji</span>
        </div>
        <div className="text-center sm:text-right">
          Copyright Politeknik Negeri Jember 2026. Pendanaan PNBP Polije 2026
        </div>
      </footer>
    );
  }

  if (isPetaRoute) {
    return (
      <div className="absolute bottom-3 right-4 z-40 bg-white/90 backdrop-blur-md border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-sm text-[11px] text-gray-700 flex items-center gap-2 max-w-[calc(100vw-2rem)] sm:max-w-none">
        <Image
          src="/logo-kabupaten-jember.png"
          alt="Logo Kabupaten Jember"
          width={14}
          height={14}
          className="w-3.5 h-3.5 object-contain flex-shrink-0"
        />
        <span className="truncate">Copyright Politeknik Negeri Jember 2026. Pendanaan PNBP Polije 2026</span>
      </div>
    );
  }

  return (
    <footer className="w-full bg-white border-t border-[--border-default] py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[--text-secondary]">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-kabupaten-jember.png"
            alt="Logo Kabupaten Jember"
            width={24}
            height={24}
            className="w-6 h-6 object-contain flex-shrink-0"
          />
          <span className="font-semibold text-[--text-primary] text-sm">
            WebGIS Desa Rambipuji
          </span>
        </div>
        <div className="text-center sm:text-right font-medium text-gray-600">
          Copyright Politeknik Negeri Jember 2026. Pendanaan PNBP Polije 2026
        </div>
      </div>
    </footer>
  );
}
