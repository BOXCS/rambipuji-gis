"use client";

import { ExternalLink, LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname() || "";
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const isAdminRoute = pathname.startsWith("/admin");
  const isHeroRoute = pathname === "/" || pathname === "/tentang";

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: Array<{ href: string; label: string; isExternal?: boolean }> = [
    { href: "/", label: "Beranda" },
    { href: "/peta", label: "Peta Digital" },
    { href: "/potensi", label: "Katalog Potensi" },
    { href: "/tentang", label: "Tentang Desa" },
  ];

  const isLightText = isHeroRoute && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 md:h-20 z-50 flex items-center px-4 md:px-8 transition-all duration-300 ${
        isLightText
          ? "bg-black/25 backdrop-blur-md border-b border-white/15 text-white"
          : "bg-white/95 backdrop-blur-md border-b border-[--border-default] shadow-sm text-[--text-primary]"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-1 rounded-xl bg-white/10 border border-white/20 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo-kabupaten-jember.png"
              alt="Logo Kabupaten Jember"
              width={34}
              height={34}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif font-bold text-sm sm:text-base md:text-lg tracking-tight leading-tight transition-colors ${
                isLightText ? "text-white" : "text-[--color-primary]"
              }`}
            >
              Desa Rambipuji
            </span>
            <span
              className={`text-[10px] uppercase tracking-widest font-sans transition-colors ${
                isLightText ? "text-white/70" : "text-[--text-muted]"
              }`}
            >
              WebGIS &amp; Potensi Desa
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!isAdminRoute && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 h-full">
            {navLinks.map((link) => {
              const active =
                !link.isExternal &&
                (pathname === link.href ||
                  (link.href === "/potensi" && pathname.startsWith("/potensi/")));

              if (link.isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-10 px-3.5 inline-flex items-center gap-1.5 text-sm font-medium rounded-full transition-all ${
                      isLightText
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-gray-100/70"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-10 px-4 inline-flex items-center text-sm font-medium rounded-full transition-all ${
                    active
                      ? isLightText
                        ? "bg-white/20 text-white font-semibold backdrop-blur-sm shadow-sm"
                        : "bg-[--color-primary-subtle] text-[--color-primary] font-semibold"
                      : isLightText
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-gray-100/70"
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
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                isLightText
                  ? "border-white/40 text-white hover:bg-white/15 backdrop-blur-sm"
                  : "border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-subtle]"
              }`}
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
              className={`p-2 rounded-xl transition ${
                isLightText
                  ? "text-white hover:bg-white/15"
                  : "text-[--text-secondary] hover:bg-gray-100"
              }`}
              aria-label="Buka navigasi menu"
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
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
                !link.isExternal &&
                (pathname === link.href ||
                  (link.href === "/potensi" && pathname.startsWith("/potensi/")));

              if (link.isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-[--text-secondary] hover:bg-gray-50 flex items-center justify-between transition"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${active
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
