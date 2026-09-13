import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavbarWrapper from "../components/NavbarWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

import JsonLd from "../components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL
      ?? "https://rambipuji.desa.id"
  ),
  title: {
    default: "WebGIS Potensi Desa Rambipuji",
    template: "%s | WebGIS Desa Rambipuji",
  },
  description:
    "Sistem Informasi Geografis Desa Rambipuji, " +
    "Kecamatan Rambipuji, Kabupaten Jember, Jawa Timur. " +
    "Temukan potensi pertanian, UMKM, wisata budaya, " +
    "dan infrastruktur desa secara interaktif.",
  keywords: [
    "Desa Rambipuji",
    "Rambipuji Jember",
    "WebGIS Desa",
    "Potensi Desa Rambipuji",
    "Wisata Rambipuji",
    "UMKM Rambipuji",
    "Pertanian Rambipuji",
    "GIS Desa Jember",
    "Peta Desa Rambipuji",
  ],
  authors: [{ name: "Tim Pengembang WebGIS Rambipuji" }],
  creator: "Tim Pengembang WebGIS Rambipuji",
  publisher: "Pemerintah Desa Rambipuji",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "WebGIS Potensi Desa Rambipuji",
    title: "WebGIS Potensi Desa Rambipuji",
    description:
      "Jelajahi potensi Desa Rambipuji secara interaktif — " +
      "pertanian, UMKM, wisata budaya, dan infrastruktur " +
      "dalam satu peta digital.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WebGIS Potensi Desa Rambipuji",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WebGIS Potensi Desa Rambipuji",
    description:
      "Jelajahi potensi Desa Rambipuji secara interaktif.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          "name": "Desa Rambipuji",
          "alternateName": "Pemerintah Desa Rambipuji",
          "url": process.env.NEXT_PUBLIC_SITE_URL
            ?? "https://rambipuji.desa.id",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rambipuji",
            "addressRegion": "Jember",
            "addressCountry": "ID"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -8.25,
            "longitude": 113.6
          },
          "sameAs": []
        }} />
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
