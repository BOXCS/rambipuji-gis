import React from "react";
import type { KategoriSlug } from "../types";

export interface CategoryBadgeProps {
  kategori: KategoriSlug;
  size?: "sm" | "md";
}

const BADGE_MAP: Record<
  KategoriSlug,
  { label: string; bgStyle: string; textStyle: string }
> = {
  pertanian: {
    label: "Pertanian",
    bgStyle: "var(--cat-pertanian-subtle)",
    textStyle: "var(--cat-pertanian)",
  },
  umkm: {
    label: "UMKM",
    bgStyle: "var(--cat-umkm-subtle)",
    textStyle: "var(--cat-umkm)",
  },
  wisata: {
    label: "Wisata",
    bgStyle: "var(--cat-wisata-subtle)",
    textStyle: "var(--cat-wisata)",
  },
  infrastruktur: {
    label: "Infrastruktur",
    bgStyle: "var(--cat-infrastruktur-subtle)",
    textStyle: "var(--cat-infrastruktur)",
  },
  "batas-wilayah": {
    label: "Batas Wilayah",
    bgStyle: "var(--color-primary-subtle)",
    textStyle: "var(--color-primary)",
  },
};

export default function CategoryBadge({
  kategori,
  size = "sm",
}: CategoryBadgeProps) {
  const config = BADGE_MAP[kategori] || {
    label: kategori,
    bgStyle: "var(--color-neutral-subtle)",
    textStyle: "var(--color-neutral)",
  };

  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-xs font-medium"
      : "px-2.5 py-0.5 text-[11px] font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClass}`}
      style={{
        backgroundColor: config.bgStyle,
        color: config.textStyle,
      }}
    >
      {config.label}
    </span>
  );
}
