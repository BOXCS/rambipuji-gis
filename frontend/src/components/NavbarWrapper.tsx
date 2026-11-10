"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname() || "";
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/login");

  // Jangan tampilkan Navbar publik di halaman admin/login
  // karena AdminLayoutClient sudah punya header & sidebar sendiri
  if (isAdminRoute) {
    return null;
  }

  return <Navbar />;
}
