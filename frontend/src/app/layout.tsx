import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavbarWrapper from "../components/NavbarWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WebGIS Potensi Desa Rambipuji",
  description:
    "Sistem Informasi Geografis Pemetaan Potensi Desa Rambipuji, Kecamatan Rambipuji, Kabupaten Jember",
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
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
