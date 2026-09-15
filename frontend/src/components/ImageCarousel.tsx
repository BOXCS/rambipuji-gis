"use client";

import { ChevronLeft, ChevronRight, Mountain } from "lucide-react";
import NextImage from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  autoPlay?: boolean;
  aspectRatio?: "video" | "square";
}

const ASPECT_CLASSES: Record<"video" | "square", string> = {
  video: "aspect-video",
  square: "aspect-square",
};

export default function ImageCarousel({
  images,
  alt,
  autoPlay = true,
  aspectRatio = "video",
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = images.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || paused || total <= 1) return;
    timerRef.current = setInterval(goNext, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, paused, total, goNext]);

  // ── 0 images — placeholder ─────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div
        className={`w-full ${ASPECT_CLASSES[aspectRatio]} bg-[--bg-surface-raised] border border-[--border-default] rounded-xl flex flex-col items-center justify-center text-[--text-muted]`}
      >
        <Mountain className="w-12 h-12 mb-2 opacity-50" />
        <span className="text-sm">Foto tidak tersedia</span>
      </div>
    );
  }

  // ── 1 image — single image with Next.js Image ──────────────────────────────
  if (total === 1) {
    return (
      <div
        className={`relative w-full ${ASPECT_CLASSES[aspectRatio]} rounded-xl overflow-hidden border border-[--border-default] bg-[--bg-surface-raised]`}
      >
        <NextImage
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // ── 2+ images — crossfade carousel ────────────────────────────────────────
  return (
    <div
      className={`relative w-full ${ASPECT_CLASSES[aspectRatio]} rounded-xl overflow-hidden border border-[--border-default] bg-[--bg-surface-raised] group`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {images.map((src, i) => (
        <NextImage
          key={src + i}
          src={src}
          alt={`${alt} — foto ${i + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
          aria-hidden={i !== current}
        />
      ))}

      {/* Counter badge */}
      <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full pointer-events-none">
        {current + 1} / {total}
      </div>

      {/* Prev / Next buttons */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        aria-label="Foto sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        aria-label="Foto selanjutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 bg-white/80 ${
              i === current ? "w-4" : "w-1.5 opacity-60"
            }`}
            aria-label={`Foto ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
