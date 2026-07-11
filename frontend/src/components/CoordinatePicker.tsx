import dynamic from "next/dynamic";
import React from "react";
import ClientOnly from "./ClientOnly";
import type { CoordinatePickerInnerProps } from "./CoordinatePickerInner";

const CoordinatePickerInner = dynamic(
  () => import("./CoordinatePickerInner"),
  {
    ssr: false,
  }
);

export default function CoordinatePicker(props: CoordinatePickerInnerProps) {
  return (
    <ClientOnly
      fallback={
        <div className="w-full h-[500px] rounded-xl bg-[--bg-surface-raised] border border-[--border-default] flex items-center justify-center text-[--text-muted] text-xs">
          Memuat peta pemilih lokasi...
        </div>
      }
    >
      <CoordinatePickerInner {...props} />
    </ClientOnly>
  );
}

export type { CoordinatePickerInnerProps as CoordinatePickerProps };
