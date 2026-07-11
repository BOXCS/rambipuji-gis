import dynamic from "next/dynamic";
import React from "react";
import ClientOnly from "./ClientOnly";
import type { MapContainerInnerProps } from "./MapContainerInner";

const MapContainerInner = dynamic(() => import("./MapContainerInner"), {
  ssr: false,
});

export default function MapContainer(props: MapContainerInnerProps) {
  return (
    <ClientOnly
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-[--bg-surface-raised] text-[--text-secondary]">
          Memuat peta...
        </div>
      }
    >
      <MapContainerInner {...props} />
    </ClientOnly>
  );
}

export type { MapContainerInnerProps as MapContainerProps };
