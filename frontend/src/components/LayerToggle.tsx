import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
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
  borderColorVar: string;
  countKey: keyof StatistikData;
}

const LAYERS: LayerItem[] = [
  {
    key: "pertanian",
    label: "Pertanian & Perkebunan",
    colorVar: "var(--cat-pertanian)",
    borderColorVar: "var(--cat-pertanian)",
    countKey: "pertanian",
  },
  {
    key: "umkm",
    label: "UMKM & Usaha Warga",
    colorVar: "var(--cat-umkm)",
    borderColorVar: "var(--cat-umkm)",
    countKey: "umkm",
  },
  {
    key: "wisata",
    label: "Wisata & Budaya",
    colorVar: "var(--cat-wisata)",
    borderColorVar: "var(--cat-wisata)",
    countKey: "wisata",
  },
  {
    key: "infrastruktur",
    label: "Infrastruktur & Fasilitas",
    colorVar: "var(--cat-infrastruktur)",
    borderColorVar: "var(--cat-infrastruktur)",
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

  const total =
    (counts.pertanian ?? 0) +
    (counts.umkm ?? 0) +
    (counts.wisata ?? 0) +
    (counts.infrastruktur ?? 0);

  return (
    <div
      className="rounded-2xl shadow-lg border border-[--border-default] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[--bg-surface-raised] transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[--text-primary]">
          <Layers className="w-4 h-4 text-[--text-muted]" />
          Layer Peta
        </span>
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 text-[--text-muted]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[--text-muted]" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-[--border-default]">
          <div className="p-2 space-y-0.5">
            {LAYERS.map((layer) => {
              const checked = activeLayers.has(layer.key);
              const count = counts[layer.countKey] ?? 0;

              return (
                <label
                  key={layer.key}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[--bg-surface-raised] cursor-pointer select-none transition-colors"
                  style={{
                    borderLeft: `4px solid ${layer.borderColorVar}`,
                  }}
                >
                  {/* Colored dot + label */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: layer.colorVar }}
                    />
                    <span className="text-sm font-medium text-[--text-primary] truncate">
                      {layer.label}
                    </span>
                  </div>

                  {/* Count badge + toggle switch */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-[--bg-surface-raised] text-[--text-muted] px-2 py-0.5 rounded-full">
                      {count}
                    </span>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(layer.key)}
                      className="sr-only"
                    />
                    <span
                      className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                        checked ? "bg-[--color-primary]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${
                          checked ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Statistics summary footer */}
          <div className="border-t border-[--border-default] pt-3 pb-3 mt-1">
            <p className="text-xs text-[--text-muted] text-center">
              Total: {total} potensi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
