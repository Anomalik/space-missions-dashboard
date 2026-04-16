import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import type { Mission, PaginatedResponse } from "@/types";

interface MissionsTableProps {
  data: PaginatedResponse<Mission> | null;
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (column: string, order: string) => void;
  currentSort: string | null;
  currentSortOrder: string;
}

const STATUS_STYLE: Record<string, string> = {
  Success: "bg-primary/10 text-primary",
  Failure: "bg-red-500/10 text-red-500",
  "Partial Failure": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Prelaunch Failure": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const COLUMNS = [
  { key: "Company", label: "Entity", sortable: true },
  { key: "Mission", label: "Mission", sortable: true },
  { key: "Date", label: "Date", sortable: true },
  { key: "Rocket", label: "Vehicle", sortable: true },
  { key: "MissionStatus", label: "Status", sortable: true },
  { key: "RocketStatus", label: "Rocket", sortable: true },
  { key: "Location", label: "Launch Site", sortable: true },
  { key: "Price", label: "Price ($M)", sortable: true },
];

export function MissionsTable({
  data,
  isLoading,
  search,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  currentSort,
  currentSortOrder,
}: MissionsTableProps) {
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      if (searchInput !== search) {
        onSearchChange(searchInput);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (column: string) => {
    if (currentSort === column) {
      onSortChange(column, currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(column, "asc");
    }
  };

  return (
    <section className="bg-surface-container-low overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-primary-container" />
          <h3 className="font-headline text-xl font-bold">Mission Database</h3>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center bg-surface-container-lowest px-4 py-2 rounded">
            <span className="material-symbols-outlined text-sm text-slate-500">search</span>
            <Input
              placeholder="Search missions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent border-none text-xs w-48 h-6 focus-visible:ring-0 px-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rows:</span>
            <Select
              value={String(data?.page_size || 15)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-[65px] bg-surface-container-lowest border-none h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-label">
          <thead>
            <tr className="bg-surface-container-highest/30 text-slate-500 uppercase tracking-widest text-[9px]">
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-6 py-4">
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-on-surface cursor-pointer transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-12 text-outline text-[11px] font-label uppercase tracking-widest">
                  Loading telemetry...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-12 text-outline">
                  No missions found
                </td>
              </tr>
            ) : (
              data?.data.map((mission, i) => (
                <tr
                  key={`${mission.Mission}-${i}`}
                  className="hover:bg-surface-container-highest/20 transition-colors"
                >
                  <td className="px-6 py-4 font-bold">{mission.Company}</td>
                  <td className="px-6 py-4">{mission.Mission}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{mission.Date}</td>
                  <td className="px-6 py-4">{mission.Rocket}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLE[mission.MissionStatus] || "bg-outline/10 text-outline"}`}>
                      {mission.MissionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase ${mission.RocketStatus === "Active" ? "text-primary" : "text-slate-500"}`}>
                      {mission.RocketStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">{mission.Location}</td>
                  <td className="px-6 py-4 font-mono">{mission.Price ? `${mission.Price}` : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="p-4 bg-surface-container-lowest flex justify-between items-center">
          <span className="text-xs text-outline">
            Showing {((data.page - 1) * data.page_size) + 1}-{Math.min(data.page * data.page_size, data.total)} of {data.total.toLocaleString()} missions
          </span>
          <div className="flex gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => onPageChange(data.page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-surface-container hover:bg-surface-bright disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {generatePageNumbers(data.page, data.total_pages).map((p, idx) =>
              p === "..." ? (
                <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-outline text-xs">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold cursor-pointer transition-colors ${
                    data.page === p
                      ? "bg-primary text-white dark:bg-primary-container dark:text-on-primary-container"
                      : "bg-surface-container hover:bg-surface-bright text-outline"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              disabled={data.page >= data.total_pages}
              onClick={() => onPageChange(data.page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-surface-container hover:bg-surface-bright disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
