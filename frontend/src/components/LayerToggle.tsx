import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import React, { useState } from "react";
import type { KategoriSlug, StatistikData } from "../types";

export interface LayerToggleProps {
  activeLayers: Set<KategoriSlug>;
  counts: StatistikData;
  onToggle: (k: KategoriSlug) => void;
}

interface LayerItem {
  key: KategoriSlug;
  label: string;
  colorVar: string;
  countKey: keyof StatistikData;
}

const LAYERS: LayerItem[] = [
  {
    key: "pertanian",
    label: "Pertanian & Perkebunan",
    colorVar: "var(--cat-pertanian)",
    countKey: "pertanian",
  },
  {
    key: "umkm",
    label: "UMKM & Usaha Warga",
    colorVar: "var(--cat-umkm)",
    countKey: "umkm",
  },
  {
    key: "wisata",
    label: "Wisata & Budaya",
    colorVar: "var(--cat-wisata)",
    countKey: "wisata",
  },
  {
    key: "infrastruktur",
    label: "Infrastruktur & Fasilitas",
    colorVar: "var(--cat-infrastruktur)",
    countKey: "infrastruktur",
  },
];

export default function LayerToggle({
  activeLayers,
  counts,
  onToggle,
}: LayerToggleProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Pada layar mobile (< 640px), default tertutup agar tidak menghalangi peta
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsExpanded(false);
    }
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[--border-default] shadow-floating overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[--bg-surface] hover:bg-[--bg-surface-raised] transition text-left"
      >
        <span className="flex items-center text-sm font-semibold text-[--text-primary]">
          <Layers className="w-4 h-4 mr-2 text-[--color-primary]" />
          Lapisan Peta (Layers)
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[--text-secondary]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[--text-secondary]" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2.5 border-t border-[--border-default]">
          {LAYERS.map((layer) => {
            const checked = activeLayers.has(layer.key);
            const count = counts[layer.countKey] ?? 0;

            return (
              <label
                key={layer.key}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.colorVar }}
                  />
                  <span className="text-xs font-medium text-[--text-primary] group-hover:text-[--color-primary] transition">
                    {layer.label}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[--bg-surface-raised] text-[--text-secondary] rounded-full">
                    {count}
                  </span>

                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(layer.key)}
                    className="sr-only"
                  />
                  <span
                    className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${checked ? "bg-[--color-primary]" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${checked ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
