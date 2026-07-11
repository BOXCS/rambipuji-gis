import dynamic from "next/dynamic";
import React from "react";
import ClientOnly from "./ClientOnly";
import type { KategoriSlug } from "../types";

interface Props {
  kategori: KategoriSlug;
  value: GeoJSON.Geometry | null;
  onChange: (geom: GeoJSON.Geometry | null) => void;
  mode: "point" | "polygon" | "both";
}

const GeometryEditorInner = dynamic(
  () => import("./GeometryEditorInner"),
  {
    ssr: false,
  }
);

export default function GeometryEditor(props: Props) {
  return (
    <ClientOnly
      fallback={
        <div className="h-[500px] bg-[--bg-surface-raised] rounded-xl flex items-center justify-center text-[--text-muted] text-sm border border-[--border-default]">
          Memuat editor peta...
        </div>
      }
    >
      <GeometryEditorInner {...props} />
    </ClientOnly>
  );
}
