"use client";

import { LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname() || "";
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

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
          <div className="w-8 h-8 rounded bg-[--color-primary] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            R
          </div>
          <span className="font-semibold text-[--color-primary] text-sm sm:text-base md:text-lg truncate">
            WebGIS Desa Rambipuji
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isAdminRoute && (
          <nav className="hidden md:flex items-center space-x-6 h-full">
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

        {/* Desktop Admin Action & User Menu */}
        <div className="hidden md:flex items-center space-x-3">
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

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center space-x-2 md:hidden">
          {!isAdminRoute && (
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="p-2 rounded-lg text-[--text-secondary] hover:bg-gray-100 transition"
              aria-label="Buka navigasi menu"
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5 text-[--text-primary]" />
              ) : (
                <Menu className="w-5 h-5 text-[--text-primary]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMobileNavOpen && !isAdminRoute && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[--border-default] shadow-lg md:hidden p-4 space-y-2 z-50">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href === "/potensi" && pathname.startsWith("/potensi/"));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-[--color-primary-subtle] text-[--color-primary] font-semibold"
                      : "text-[--text-secondary] hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[--border-default] flex justify-between items-center">
            <Link
              href="/login"
              onClick={() => setIsMobileNavOpen(false)}
              className="w-full text-center py-2 text-xs font-medium border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-subtle] rounded-lg transition"
            >
              Masuk Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
