import { Compass, Landmark, ShoppingBag, Sparkles } from "lucide-react";
import React from "react";
import type { KategoriSlug } from "../types";

export interface FilterTabsProps {
  active: KategoriSlug | "semua";
  onChange: (v: KategoriSlug | "semua") => void;
}

interface TabOption {
  key: KategoriSlug | "semua";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const TAB_OPTIONS: TabOption[] = [
  { key: "semua", label: "Semua", icon: Compass, accentColor: "#059669" },
  { key: "wisata", label: "Wisata", icon: Sparkles, accentColor: "#0284c7" },
  { key: "umkm", label: "UMKM", icon: ShoppingBag, accentColor: "#d97706" },
  { key: "infrastruktur", label: "Infrastruktur", icon: Landmark, accentColor: "#475569" },
];

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
      {TAB_OPTIONS.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 whitespace-nowrap select-none ${
              isActive
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/25 ring-2 ring-slate-900/10 scale-[1.02]"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ${
                isActive ? "text-emerald-400 scale-110" : "text-slate-400"
              }`}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
