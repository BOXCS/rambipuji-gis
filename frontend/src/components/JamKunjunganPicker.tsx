"use client";

import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();
const DEFAULT_BUKA = "08:00";
const DEFAULT_TUTUP = "17:00";
const TUTUP_VALUE = "Tutup";
const DUA_PULUH_EMPAT_JAM = "24 Jam";

function parseValue(value: string): {
  buka: string;
  tutup: string;
  mode: "range" | "24jam" | "tutup";
} {
  if (value === DUA_PULUH_EMPAT_JAM) {
    return { buka: DEFAULT_BUKA, tutup: DEFAULT_TUTUP, mode: "24jam" };
  }
  if (value === TUTUP_VALUE) {
    return { buka: DEFAULT_BUKA, tutup: DEFAULT_TUTUP, mode: "tutup" };
  }
  const match = value.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  if (match) {
    const [, buka, tutup] = match;
    const validBuka = TIME_OPTIONS.includes(buka) ? buka : DEFAULT_BUKA;
    const validTutup = TIME_OPTIONS.includes(tutup) ? tutup : DEFAULT_TUTUP;
    return { buka: validBuka, tutup: validTutup, mode: "range" };
  }
  return { buka: DEFAULT_BUKA, tutup: DEFAULT_TUTUP, mode: "range" };
}

interface JamKunjunganPickerProps {
  value: string;
  onChange: (v: string) => void;
}

export default function JamKunjunganPicker({
  value,
  onChange,
}: JamKunjunganPickerProps) {
  const parsed = parseValue(value);

  const [buka, setBuka] = useState<string>(parsed.buka);
  const [tutup, setTutup] = useState<string>(parsed.tutup);
  const [mode, setMode] = useState<"range" | "24jam" | "tutup">(parsed.mode);
  const [lastTimeValue, setLastTimeValue] = useState<string>(
    parsed.mode === "range"
      ? `${parsed.buka} - ${parsed.tutup}`
      : `${DEFAULT_BUKA} - ${DEFAULT_TUTUP}`
  );

  useEffect(() => {
    const p = parseValue(value);
    setBuka(p.buka);
    setTutup(p.tutup);
    setMode(p.mode);
    if (p.mode === "range") {
      setLastTimeValue(`${p.buka} - ${p.tutup}`);
    }
  }, [value]);

  const handleBukaChange = (newBuka: string) => {
    setBuka(newBuka);
    const combined = `${newBuka} - ${tutup}`;
    setLastTimeValue(combined);
    onChange(combined);
  };

  const handleTutupChange = (newTutup: string) => {
    setTutup(newTutup);
    const combined = `${buka} - ${newTutup}`;
    setLastTimeValue(combined);
    onChange(combined);
  };

  const handleModeChange = (newMode: "range" | "24jam" | "tutup") => {
    setMode(newMode);
    if (newMode === "24jam") {
      onChange(DUA_PULUH_EMPAT_JAM);
    } else if (newMode === "tutup") {
      onChange(TUTUP_VALUE);
    } else {
      onChange(lastTimeValue);
      const p = parseValue(lastTimeValue);
      setBuka(p.buka);
      setTutup(p.tutup);
    }
  };

  const selectClass =
    "px-3 py-2 text-sm border border-[--border-default] rounded-lg " +
    "bg-white text-[--text-primary] focus:outline-none focus:border-[--color-primary] " +
    "disabled:bg-gray-100 disabled:text-[--text-muted] disabled:cursor-not-allowed " +
    "cursor-pointer";

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-[--text-primary]">
        <Clock className="w-3.5 h-3.5 text-[--color-primary]" />
        Jam Kunjungan
      </label>

      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-[--text-muted] font-medium">
            Buka
          </span>
          <select
            value={buka}
            disabled={mode !== "range"}
            onChange={(e) => handleBukaChange(e.target.value)}
            className={selectClass}
            aria-label="Jam buka kunjungan"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[--text-muted] text-sm font-medium mt-4">—</span>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-[--text-muted] font-medium">
            Tutup
          </span>
          <select
            value={tutup}
            disabled={mode !== "range"}
            onChange={(e) => handleTutupChange(e.target.value)}
            className={selectClass}
            aria-label="Jam tutup kunjungan"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-[--text-muted]">
        {mode === "24jam"
          ? "Buka 24 jam"
          : mode === "tutup"
            ? "Tutup"
            : `Buka pukul ${buka} hingga ${tutup}`}
      </p>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mode === "24jam"}
            onChange={(e) =>
              handleModeChange(e.target.checked ? "24jam" : "range")
            }
            className="w-3.5 h-3.5 accent-[--color-primary] cursor-pointer"
          />
          <span className="text-xs text-[--text-secondary]">Buka 24 Jam</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mode === "tutup"}
            onChange={(e) =>
              handleModeChange(e.target.checked ? "tutup" : "range")
            }
            className="w-3.5 h-3.5 accent-[--color-primary] cursor-pointer"
          />
          <span className="text-xs text-[--text-secondary]">Tutup</span>
        </label>
      </div>
    </div>
  );
}
