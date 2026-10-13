"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export interface HeroCarouselImage {
  url: string;
  title: string;
  category?: string;
}

export interface HeroCarouselProps {
  images: HeroCarouselImage[];
  children: React.ReactNode;
  fullScreen?: boolean;
  heightClass?: string;
  overlayGradient?: string;
  showScrollPrompt?: boolean;
}

export default function HeroCarousel({
  images,
  children,
  fullScreen = false,
  heightClass,
  overlayGradient,
  showScrollPrompt = false,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // switch slide every 5 seconds

    return () => clearInterval(interval);
  }, [images]);

  const currentImg = images[currentIndex];

  const defaultOverlay = fullScreen
    ? "linear-gradient(180deg, rgba(6, 24, 15, 0.45) 0%, rgba(6, 24, 15, 0.65) 50%, rgba(5, 17, 11, 0.94) 100%)"
    : "linear-gradient(to bottom right, rgba(16, 70, 43, 0.88), rgba(15, 61, 40, 0.94))";

  return (
    <section
      className={`relative text-white overflow-hidden flex items-center ${
        heightClass
          ? heightClass
          : fullScreen
          ? "min-h-screen h-screen"
          : "min-h-[420px] pt-16"
      }`}
    >
      {/* Background carousel images with crossfade opacity & subtle scale */}
      {images.map((img, idx) => (
        <div
          key={`${img.url}-${idx}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          <Image
            src={img.url}
            alt={img.title}
            fill
            priority={idx === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient overlay to guarantee text legibility & rich mood */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: overlayGradient || defaultOverlay,
        }}
      />

      {/* Hero content container */}
      <div
        className={`relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 flex flex-col justify-between ${
          fullScreen ? "h-full pt-24 pb-12" : ""
        }`}
      >
        <div className="my-auto">{children}</div>

        {/* Floating slide indicators & current slide title */}
        {images.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-white/80">
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[280px] sm:max-w-md">
                Potensi Rambipuji: <strong>{currentImg?.title || "Desa Rambipuji"}</strong>
              </span>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ke slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showScrollPrompt && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/70 animate-bounce pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-sans">Jelajahi</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      )}
    </section>
  );
}
