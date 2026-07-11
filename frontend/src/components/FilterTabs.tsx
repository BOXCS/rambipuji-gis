import React from "react";
import type { KategoriSlug } from "../types";

export interface FilterTabsProps {
  active: KategoriSlug | "semua";
  onChange: (v: KategoriSlug | "semua") => void;
}

interface TabOption {
  key: KategoriSlug | "semua";
  label: string;
  colorVar: string;
}

const TAB_OPTIONS: TabOption[] = [
  { key: "semua", label: "Semua", colorVar: "var(--color-primary)" },
  { key: "pertanian", label: "Pertanian", colorVar: "var(--cat-pertanian)" },
  { key: "umkm", label: "UMKM", colorVar: "var(--cat-umkm)" },
  { key: "wisata", label: "Wisata", colorVar: "var(--cat-wisata)" },
  { key: "infrastruktur", label: "Infrastruktur", colorVar: "var(--cat-infrastruktur)" },
];

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[--border-default] overflow-x-auto">
      {TAB_OPTIONS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition whitespace-nowrap ${
              isActive
                ? "border-b-2 font-semibold"
                : "text-[--text-secondary] hover:text-[--text-primary] border-b-2 border-transparent"
            }`}
            style={
              isActive
                ? { color: tab.colorVar, borderColor: tab.colorVar }
                : undefined
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
