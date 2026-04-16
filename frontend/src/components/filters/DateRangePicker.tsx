import { useState, useEffect, useRef } from "react";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onStartChange: (date: string | null) => void;
  onEndChange: (date: string | null) => void;
}

const PRESETS = [
  { label: "All Time", start: null, end: null },
  { label: "2010s–Now", start: "2010-01-01", end: "2022-12-31" },
  { label: "2000s", start: "2000-01-01", end: "2009-12-31" },
  { label: "1990s", start: "1990-01-01", end: "1999-12-31" },
  { label: "1980s", start: "1980-01-01", end: "1989-12-31" },
  { label: "Pre-1980", start: "1957-01-01", end: "1979-12-31" },
];

function formatLabel(start: string | null, end: string | null): string {
  if (!start && !end) return "All Time";
  // Check if it matches a preset
  const preset = PRESETS.find((p) => p.start === start && p.end === end);
  if (preset) return preset.label;
  const s = start ? start.slice(0, 4) : "1957";
  const e = end ? end.slice(0, 4) : "2022";
  return s === e ? s : `${s}–${e}`;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [customStart, setCustomStart] = useState(startDate?.slice(0, 4) || "");
  const [customEnd, setCustomEnd] = useState(endDate?.slice(0, 4) || "");

  useEffect(() => {
    setCustomStart(startDate?.slice(0, 4) || "");
    setCustomEnd(endDate?.slice(0, 4) || "");
  }, [startDate, endDate]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function applyPreset(start: string | null, end: string | null) {
    onStartChange(start);
    onEndChange(end);
    setOpen(false);
  }

  function applyCustom() {
    const s = parseInt(customStart);
    const e = parseInt(customEnd);
    if (s >= 1957 && s <= 2022) {
      onStartChange(`${s}-01-01`);
    }
    if (e >= 1957 && e <= 2022) {
      onEndChange(`${e}-12-31`);
    }
    setOpen(false);
  }

  const isActive = (preset: typeof PRESETS[number]) =>
    preset.start === startDate && preset.end === endDate;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-container border border-outline-variant/15 rounded-lg text-xs font-medium h-9 px-3 cursor-pointer hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-outline text-sm">date_range</span>
        <span>{formatLabel(startDate, endDate)}</span>
        <svg className="w-3.5 h-3.5 text-outline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[220px] z-[101] bg-surface-container border border-outline-variant/15 rounded-lg shadow-lg overflow-hidden">
          {/* Presets */}
          <div className="py-1 border-b border-outline-variant/10">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.start, preset.end)}
                className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${
                  isActive(preset) ? "text-primary font-semibold" : "text-on-surface"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom year range */}
          <div className="p-3">
            <div className="text-[9px] uppercase tracking-widest text-outline mb-2 font-medium">Custom Range</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="1957"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-2.5 py-1.5 rounded outline-none placeholder:text-outline text-center"
                maxLength={4}
              />
              <span className="text-outline text-[10px]">–</span>
              <input
                type="text"
                placeholder="2022"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-2.5 py-1.5 rounded outline-none placeholder:text-outline text-center"
                maxLength={4}
              />
            </div>
            <button
              onClick={applyCustom}
              className="w-full mt-2 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
