import { Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Cari nama potensi desa...",
}: SearchInputProps) {
  const [innerValue, setInnerValue] = useState<string>(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (innerValue !== value) {
        onChange(innerValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [innerValue, value, onChange]);

  const handleClear = () => {
    setInnerValue("");
    onChange("");
  };

  return (
    <div className="relative w-full sm:max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
      <input
        type="text"
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary] text-[--text-primary] placeholder-[--text-muted] transition"
      />
      {innerValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[--text-muted] hover:text-[--text-primary] transition"
          aria-label="Bersihkan pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
