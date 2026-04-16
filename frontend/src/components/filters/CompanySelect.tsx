import { useState, useMemo, useEffect, useRef } from "react";

interface CompanySelectProps {
  companies: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CompanySelect({ companies, value, onChange }: CompanySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.toLowerCase().includes(q));
  }, [companies, search]);

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

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="flex items-center justify-between gap-2 w-[180px] bg-surface-container border border-outline-variant/15 rounded-lg text-xs font-medium h-9 px-3 cursor-pointer hover:bg-surface-container-low transition-colors"
      >
        <span className="truncate">{value || "All Companies"}</span>
        <svg className="w-3.5 h-3.5 text-outline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[220px] z-[101] bg-surface-container border border-outline-variant/15 rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-outline-variant/10">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface text-xs px-2.5 py-1.5 rounded outline-none placeholder:text-outline"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${
                !value ? "text-primary font-semibold" : "text-on-surface"
              }`}
            >
              All Companies
            </button>
            {filtered.map((company) => (
              <button
                key={company}
                onClick={() => { onChange(company); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-primary/10 transition-colors ${
                  value === company ? "text-primary font-semibold" : "text-on-surface"
                }`}
              >
                {company}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-outline">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
