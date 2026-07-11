"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname() || "";
  const { isAuthenticated, user, logout } = useAuth();
  const isAdminRoute = pathname.startsWith("/admin");
  const isPetaRoute = pathname === "/peta" || pathname === "/";

  const navLinks = [
    { href: "/peta", label: "Peta" },
    { href: "/potensi", label: "Potensi" },
    { href: "/tentang", label: "Tentang" },
  ];

  return (
    <header
      className={`w-full h-16 border-b border-[--border-default] z-50 flex items-center px-4 md:px-8 transition-colors ${
        isPetaRoute
          ? "absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm"
          : "bg-white"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/peta" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[--color-primary] flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="font-semibold text-[--color-primary] text-base md:text-lg">
            WebGIS Desa Rambipuji
          </span>
        </Link>

        {!isAdminRoute && (
          <nav className="flex items-center space-x-6 h-full">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href === "/potensi" && pathname.startsWith("/potensi/"));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-16 inline-flex items-center px-1 text-sm font-medium transition ${
                    active
                      ? "border-b-2 border-[--color-primary] text-[--color-primary] font-semibold"
                      : "text-[--text-secondary] hover:text-[--text-primary] border-b-2 border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center space-x-3">
          {isAdminRoute && isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center text-sm font-medium text-[--text-primary]">
                <User className="w-4 h-4 mr-1.5 text-[--color-primary]" />
                {user?.username || "Admin"}
              </span>
              <button
                type="button"
                onClick={logout}
                className="p-2 text-[--text-secondary] hover:text-red-600 rounded-lg transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-medium border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-subtle] rounded-lg transition"
            >
              Masuk Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
