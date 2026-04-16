import { CompanySelect } from "./CompanySelect";
import { StatusMultiSelect } from "./StatusMultiSelect";
import { DateRangePicker } from "./DateRangePicker";
import { Button } from "@/components/ui/button";
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
      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onStartChange={(startDate) => onFilterChange({ startDate })}
        onEndChange={(endDate) => onFilterChange({ endDate })}
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
