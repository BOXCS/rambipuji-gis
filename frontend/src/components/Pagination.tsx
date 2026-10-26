import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 9,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers with smart ellipsis for large page counts
  const getPageNumbers = (): (number | "dots-prev" | "dots-next")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "dots-prev" | "dots-next")[] = [];

    if (currentPage <= 4) {
      // Near beginning: 1, 2, 3, 4, 5, ..., totalPages
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("dots-next");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Near end: 1, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages
      pages.push(1);
      pages.push("dots-prev");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // In the middle: 1, ..., currentPage - 1, currentPage, currentPage + 1, ..., totalPages
      pages.push(1);
      pages.push("dots-prev");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("dots-next");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const startItem = totalItems !== undefined ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem =
    totalItems !== undefined
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

  return (
    <div
      className={`pt-8 mt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Items info */}
      {totalItems !== undefined && (
        <div className="text-xs sm:text-sm text-slate-600 order-2 sm:order-1">
          Menampilkan{" "}
          <span className="font-semibold text-slate-900">{startItem}</span>
          {" - "}
          <span className="font-semibold text-slate-900">{endItem}</span>
          {" dari "}
          <span className="font-semibold text-slate-900">{totalItems}</span>
          {" potensi"}
        </div>
      )}

      {/* Navigation buttons */}
      <nav
        aria-label="Navigasi Halaman"
        className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman Sebelumnya"
          className={`h-9 px-3 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-all select-none ${
            currentPage <= 1
              ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200/60"
              : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs hover:shadow"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((p, idx) => {
            if (p === "dots-prev" || p === "dots-next") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-1.5 sm:px-2 text-slate-400 select-none text-xs sm:text-sm font-semibold tracking-widest"
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Halaman ${p}`}
                className={`min-w-9 h-9 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none flex items-center justify-center ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600/20 scale-105"
                    : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs hover:shadow"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Halaman Berikutnya"
          className={`h-9 px-3 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-all select-none ${
            currentPage >= totalPages
              ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200/60"
              : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs hover:shadow"
          }`}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
