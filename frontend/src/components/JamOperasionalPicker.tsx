"use client";

import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Time option generation — 30-minute intervals 00:00 → 23:30
// ---------------------------------------------------------------------------

function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();
const DEFAULT_BUKA = "08:00";
const DEFAULT_TUTUP = "17:00";
const TUTUP_VALUE = "Tutup";

// ---------------------------------------------------------------------------
// Parse incoming value string into buka/tutup/tutupHarian
// ---------------------------------------------------------------------------

function parseValue(value: string): {
  buka: string;
  tutup: string;
  tutupHarian: boolean;
} {
  if (value === TUTUP_VALUE) {
    return { buka: DEFAULT_BUKA, tutup: DEFAULT_TUTUP, tutupHarian: true };
  }
  const match = value.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  if (match) {
    const [, buka, tutup] = match;
    const validBuka = TIME_OPTIONS.includes(buka) ? buka : DEFAULT_BUKA;
    const validTutup = TIME_OPTIONS.includes(tutup) ? tutup : DEFAULT_TUTUP;
    return { buka: validBuka, tutup: validTutup, tutupHarian: false };
  }
  // Legacy free-text or empty — fall back to defaults
  return { buka: DEFAULT_BUKA, tutup: DEFAULT_TUTUP, tutupHarian: false };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface JamOperasionalPickerProps {
  value: string;
  onChange: (v: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function JamOperasionalPicker({
  value,
  onChange,
}: JamOperasionalPickerProps) {
  const parsed = parseValue(value);

  const [buka, setBuka] = useState<string>(parsed.buka);
  const [tutup, setTutup] = useState<string>(parsed.tutup);
  const [tutupHarian, setTutupHarian] = useState<boolean>(parsed.tutupHarian);
  // Remember the last time value so toggling "Tutup" back restores it
  const [lastTimeValue, setLastTimeValue] = useState<string>(
    parsed.tutupHarian ? `${DEFAULT_BUKA} - ${DEFAULT_TUTUP}` : `${parsed.buka} - ${parsed.tutup}`
  );

  // Sync from parent when value changes externally (e.g. edit page pre-population)
  useEffect(() => {
    const p = parseValue(value);
    setBuka(p.buka);
    setTutup(p.tutup);
    setTutupHarian(p.tutupHarian);
    if (!p.tutupHarian) {
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

  const handleTutupHarianChange = (checked: boolean) => {
    setTutupHarian(checked);
    if (checked) {
      onChange(TUTUP_VALUE);
    } else {
      // Restore previous time value
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
      {/* Label */}
      <label className="flex items-center gap-1.5 text-xs font-semibold text-[--text-primary]">
        <Clock className="w-3.5 h-3.5 text-[--color-primary]" />
        Jam Operasional
      </label>

      {/* Time selectors row */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-[--text-muted] font-medium">Buka</span>
          <select
            value={buka}
            disabled={tutupHarian}
            onChange={(e) => handleBukaChange(e.target.value)}
            className={selectClass}
            aria-label="Jam buka"
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
          <span className="text-[10px] text-[--text-muted] font-medium">Tutup</span>
          <select
            value={tutup}
            disabled={tutupHarian}
            onChange={(e) => handleTutupChange(e.target.value)}
            className={selectClass}
            aria-label="Jam tutup"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview text */}
      <p className="text-xs text-[--text-muted]">
        {tutupHarian
          ? "Usaha ini tutup sepanjang hari."
          : `Buka pukul ${buka} hingga ${tutup}`}
      </p>

      {/* Tutup Sepanjang Hari checkbox */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={tutupHarian}
          onChange={(e) => handleTutupHarianChange(e.target.checked)}
          className="w-3.5 h-3.5 accent-[--color-primary] cursor-pointer"
          aria-label="Tutup sepanjang hari"
        />
        <span className="text-xs text-[--text-secondary]">Tutup Sepanjang Hari</span>
      </label>
    </div>
  );
}
