import { CompanySelect } from "./CompanySelect";
import { StatusMultiSelect } from "./StatusMultiSelect";
import { DateRangePicker } from "./DateRangePicker";
import { X } from "lucide-react";
import type { FilterState } from "@/types";

interface FilterBarProps {
  filters: FilterState;
  companies: string[];
  statuses: string[];
  onFilterChange: (update: Partial<FilterState>) => void;
  onReset: () => void;
}

export function FilterBar({ filters, companies, statuses, onFilterChange, onReset }: FilterBarProps) {
  const hasActiveFilters =
    filters.company !== null ||
    filters.statuses.length > 0 ||
    filters.startDate !== null ||
    filters.endDate !== null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CompanySelect
        companies={companies}
        value={filters.company}
        onChange={(company) => onFilterChange({ company })}
      />
      <StatusMultiSelect
        statuses={statuses}
        selected={filters.statuses}
        onChange={(statuses) => onFilterChange({ statuses })}
      />
      <div className="h-8 w-[1px] bg-outline-variant/20 mx-1" />
      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onStartChange={(startDate) => onFilterChange({ startDate })}
        onEndChange={(endDate) => onFilterChange({ endDate })}
      />
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 text-outline hover:text-on-surface text-xs font-medium transition-colors cursor-pointer"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
