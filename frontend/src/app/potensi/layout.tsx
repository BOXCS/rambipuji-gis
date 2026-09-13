import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Katalog Potensi Desa",
  description:
    "Direktori lengkap potensi Desa Rambipuji — " +
    "pertanian, UMKM, destinasi wisata budaya, " +
    "dan fasilitas infrastruktur desa.",
  alternates: { canonical: "/potensi" },
  openGraph: {
    title: "Katalog Potensi Desa Rambipuji",
    description:
      "Jelajahi seluruh potensi unggulan " +
      "Desa Rambipuji dalam format direktori.",
    url: "/potensi",
  },
};

export default function PotensiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
