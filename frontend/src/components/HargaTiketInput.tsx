"use client";

import { Tag, Ticket } from "lucide-react";
import React, { useEffect, useState } from "react";

type TicketType = "gratis" | "berbayar" | "sukarela";

function parseTicketValue(val: string): {
  type: TicketType;
  min: string;
  max: string;
} {
  if (!val || val.trim() === "Gratis") {
    return { type: "gratis", min: "5000", max: "" };
  }
  if (val.trim() === "Sukarela") {
    return { type: "sukarela", min: "5000", max: "" };
  }
  if (val.startsWith("Rp") || /\d/.test(val)) {
    const parts = val.split("-");
    const parseNum = (s: string) => s.replace(/\D/g, "");
    const min = parseNum(parts[0]) || "0";
    const max = parts[1] ? parseNum(parts[1]) : "";
    return { type: "berbayar", min, max };
  }
  return { type: "gratis", min: "5000", max: "" };
}

interface HargaTiketInputProps {
  value: string;
  onChange: (v: string) => void;
}

export default function HargaTiketInput({
  value,
  onChange,
}: HargaTiketInputProps) {
  const parsed = parseTicketValue(value);

  const [ticketType, setTicketType] = useState<TicketType>(parsed.type);
  const [minPrice, setMinPrice] = useState<string>(parsed.min);
  const [maxPrice, setMaxPrice] = useState<string>(parsed.max);

  useEffect(() => {
    const p = parseTicketValue(value);
    setTicketType(p.type);
    if (p.type === "berbayar") {
      setMinPrice(p.min);
      setMaxPrice(p.max);
    }
  }, [value]);

  const emitBerbayar = (minStr: string, maxStr: string) => {
    const minNum = parseInt(minStr || "0", 10);
    const maxNum = parseInt(maxStr || "0", 10);
    const minFmt = minNum.toLocaleString("id-ID");
    if (maxStr && maxNum > 0 && maxNum !== minNum) {
      const maxFmt = maxNum.toLocaleString("id-ID");
      onChange(`Rp ${minFmt} - Rp ${maxFmt}`);
    } else {
      onChange(`Rp ${minFmt}`);
    }
  };

  const handleTypeChange = (newType: TicketType) => {
    setTicketType(newType);
    if (newType === "gratis") {
      onChange("Gratis");
    } else if (newType === "sukarela") {
      onChange("Sukarela");
    } else {
      emitBerbayar(minPrice || "5000", maxPrice);
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMinPrice(val);
    emitBerbayar(val, maxPrice);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxPrice(val);
    emitBerbayar(minPrice, val);
  };

  const getPreviewText = () => {
    if (ticketType === "gratis") return "Gratis / Tidak dipungut biaya";
    if (ticketType === "sukarela") return "Sukarela / Seikhlasnya";
    const minNum = parseInt(minPrice || "0", 10);
    const maxNum = parseInt(maxPrice || "0", 10);
    const minFmt = minNum.toLocaleString("id-ID");
    if (maxPrice && maxNum > 0 && maxNum !== minNum) {
      const maxFmt = maxNum.toLocaleString("id-ID");
      return `Rp ${minFmt} - Rp ${maxFmt} per orang`;
    }
    return `Rp ${minFmt} per orang`;
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-[--text-primary]">
        <Ticket className="w-3.5 h-3.5 text-[--color-primary]" />
        Harga Tiket
      </label>

      {/* Radio options */}
      <div className="flex flex-wrap gap-4">
        {(["gratis", "berbayar", "sukarela"] as const).map((type) => {
          const labelMap: Record<TicketType, string> = {
            gratis: "Gratis",
            berbayar: "Berbayar",
            sukarela: "Sukarela",
          };
          return (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="ticket_type"
                checked={ticketType === type}
                onChange={() => handleTypeChange(type)}
                className="w-4 h-4 accent-[--color-primary] cursor-pointer"
              />
              <span className="text-xs font-medium text-[--text-primary]">
                {labelMap[type]}
              </span>
            </label>
          );
        })}
      </div>

      {/* Berbayar inputs */}
      {ticketType === "berbayar" && (
        <div className="flex items-center gap-2 pt-1">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[--text-muted] font-medium">
              Rp
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={minPrice}
              onChange={handleMinChange}
              placeholder="5000"
              className="w-32 pl-8 pr-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
            />
          </div>

          <span className="text-xs text-[--text-secondary] font-medium">
            s/d
          </span>

          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[--text-muted] font-medium">
              Rp
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={maxPrice}
              onChange={handleMaxChange}
              placeholder="Opsional"
              className="w-32 pl-8 pr-3 py-2 text-sm border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary]"
            />
          </div>
        </div>
      )}

      {/* Preview Tag */}
      <div className="flex items-center gap-1.5 text-xs text-[--text-muted] bg-[--bg-surface-raised] px-3 py-2 rounded-lg border border-[--border-default]">
        <Tag className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
        <span>{getPreviewText()}</span>
      </div>
    </div>
  );
}
