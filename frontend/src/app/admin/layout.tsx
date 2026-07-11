"use client";

import {
  Building2,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mountain,
  Store,
  Upload,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { isAuthenticated, isAuthLoading, user, logout } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

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
      {/* Fixed Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-[--border-default] z-40 flex flex-col">
        {/* Top Branding */}
        <div className="h-16 px-4 flex items-center space-x-2.5 border-b border-[--border-default]">
          <div className="w-8 h-8 rounded bg-[--color-primary] flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="font-bold text-[--text-primary] text-sm">
            Admin Panel
          </span>
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
                className={`w-full px-3 py-2.5 rounded-lg flex items-center space-x-3 text-xs font-medium transition ${
                  active
                    ? "bg-[--color-primary-subtle] text-[--color-primary] font-semibold"
                    : "text-[--text-secondary] hover:bg-[--color-neutral-subtle] hover:text-[--text-primary]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[--color-primary]" : "text-[--text-muted]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Logout Action */}
        <div className="p-3 border-t border-[--border-default]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg flex items-center space-x-3 text-xs font-medium text-[--text-secondary] hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-4 h-4 text-[--text-muted]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-56 flex-grow flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-[--border-default] px-6 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-sm font-semibold text-[--text-primary]">
            {getPageTitle()}
          </h1>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-xs font-medium text-[--text-primary]">
              <User className="w-3.5 h-3.5 mr-1.5 text-[--color-primary]" />
              {user?.username || "Admin"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[--color-primary-subtle] text-[--color-primary]">
              {user?.role || "operator"}
            </span>
          </div>
        </header>

        {/* Page Children */}
        <main className="p-6 flex-grow">{children}</main>
      </div>
    </div>
  );
}
