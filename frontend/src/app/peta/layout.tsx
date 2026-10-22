import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Peta Potensi",
  description:
    "Peta interaktif potensi Desa Rambipuji. " +
    "Lihat lokasi UMKM, wisata budaya, " +
    "dan fasilitas umum dalam satu tampilan peta.",
  alternates: { canonical: "/peta" },
  openGraph: {
    title: "Peta Potensi Desa Rambipuji",
    description:
      "Peta interaktif potensi Desa Rambipuji — " +
      "UMKM, wisata, dan infrastruktur.",
    url: "/peta",
  },
};

export default function PetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
