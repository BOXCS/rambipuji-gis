"use client";

import {
  Building2,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Mountain,
  Store,
  Upload,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { isAuthenticated, isAuthLoading, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Tutup sidebar otomatis di mobile setiap kali route berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/data/pertanian",
      label: "Pertanian",
      icon: Leaf,
    },
    {
      href: "/admin/data/umkm",
      label: "UMKM",
      icon: Store,
    },
    {
      href: "/admin/data/wisata",
      label: "Wisata",
      icon: Mountain,
    },
    {
      href: "/admin/data/infrastruktur",
      label: "Infrastruktur",
      icon: Building2,
    },
    {
      href: "/admin/import",
      label: "Import Shapefile",
      icon: Upload,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname === "/admin/dashboard") return "Dashboard";
    if (pathname.includes("/data/pertanian")) return "Data Pertanian";
    if (pathname.includes("/data/umkm")) return "Data UMKM";
    if (pathname.includes("/data/wisata")) return "Data Wisata";
    if (pathname.includes("/data/infrastruktur")) return "Data Infrastruktur";
    if (pathname === "/admin/import") return "Import Shapefile";
    return "Admin Panel";
  };

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[--bg-surface] flex">
      {/* Overlay Backdrop untuk Mobile & Tablet */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Sidebar (Slide-over di mobile/tablet, Fixed left di desktop/monitor) */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-[--border-default] z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[--border-default]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[--color-primary] flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="font-bold text-[--text-primary] text-sm">
              Admin Panel
            </span>
          </div>

          {/* Tombol Tutup Sidebar untuk Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-[--text-secondary] hover:bg-gray-100 lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-grow overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full px-3.5 py-3 rounded-lg flex items-center space-x-3 text-sm font-medium transition ${
                  active
                    ? "bg-[--color-primary-subtle] text-[--color-primary] font-semibold"
                    : "text-[--text-secondary] hover:bg-[--color-neutral-subtle] hover:text-[--text-primary]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    active ? "text-[--color-primary]" : "text-[--text-muted]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Logout Action */}
        <div className="p-3 border-t border-[--border-default]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-lg flex items-center space-x-3 text-sm font-medium text-[--text-secondary] hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-4 h-4 text-[--text-muted] flex-shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (0 margin di mobile/tablet, ml-64 di desktop/monitor) */}
      <div className="w-full lg:ml-64 flex-grow flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[--border-default] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            {/* Tombol Hamburger di Mobile/Tablet */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-[--text-secondary] hover:bg-gray-100 lg:hidden"
              aria-label="Buka Menu Admin"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-[--text-primary] truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="inline-flex items-center text-xs sm:text-sm font-medium text-[--text-primary]">
              <User className="w-4 h-4 mr-1.5 text-[--color-primary]" />
              <span className="max-w-[100px] sm:max-w-none truncate">
                {user?.username || "Admin"}
              </span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase bg-[--color-primary-subtle] text-[--color-primary]">
              {user?.role || "operator"}
            </span>
          </div>
        </header>

        {/* Page Children */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">{children}</main>
      </div>
    </div>
  );
}
