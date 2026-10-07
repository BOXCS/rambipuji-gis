"use client";

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
}

export default function HeroCarousel({ images, children }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500); // switch slide every 4.5 seconds

    return () => clearInterval(interval);
  }, [images]);

  const currentImg = images[currentIndex];

  return (
    <section className="relative text-white overflow-hidden min-h-[380px] flex items-center">
      {/* Background carousel images with crossfade opacity */}
      {images.map((img, idx) => (
        <div
          key={`${img.url}-${idx}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
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

      {/* Dark green gradient overlay to guarantee text legibility */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(16, 70, 43, 0.88), rgba(15, 61, 40, 0.94))",
        }}
      />

      {/* Hero content container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col justify-between">
        <div>{children}</div>

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
    </section>
  );
}
