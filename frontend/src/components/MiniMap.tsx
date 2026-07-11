import dynamic from "next/dynamic";
import React from "react";
import ClientOnly from "./ClientOnly";
import type { MiniMapInnerProps } from "./MiniMapInner";

const MiniMapInner = dynamic(() => import("./MiniMapInner"), {
  ssr: false,
});

export default function MiniMap(props: MiniMapInnerProps) {
  return (
    <ClientOnly
      fallback={
        <div className="w-full h-48 rounded-xl bg-[--bg-surface-raised] flex items-center justify-center text-[--text-muted] text-xs">
          Memuat peta kecil...
        </div>
      }
    >
      <MiniMapInner {...props} />
    </ClientOnly>
  );
}

export type { MiniMapInnerProps as MiniMapProps };
