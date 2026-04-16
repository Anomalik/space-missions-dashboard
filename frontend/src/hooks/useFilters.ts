import { useState, useCallback, useEffect, useMemo } from "react";
import type { FilterState } from "@/types";

function getFiltersFromUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return {
    company: params.get("company") || null,
    statuses: params.get("statuses")?.split(",").filter(Boolean) || [],
    startDate: params.get("start_date") || null,
    endDate: params.get("end_date") || null,
    search: params.get("search") || "",
  };
}

function setFiltersInUrl(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.company) params.set("company", filters.company);
  if (filters.statuses.length > 0) params.set("statuses", filters.statuses.join(","));
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  if (filters.search) params.set("search", filters.search);

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState(null, "", newUrl);
}

export function useFilters() {
  const [filters, setFiltersState] = useState<FilterState>(getFiltersFromUrl);

  useEffect(() => {
    setFiltersInUrl(filters);
  }, [filters]);

  const setFilters = useCallback((update: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...update }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      company: null,
      statuses: [],
      startDate: null,
      endDate: null,
      search: "",
    });
  }, []);

  const filterParams = useMemo(() => ({
    company: filters.company,
    statuses: filters.statuses.length > 0 ? filters.statuses.join(",") : null,
    start_date: filters.startDate,
    end_date: filters.endDate,
    search: filters.search || null,
  }), [filters.company, filters.statuses, filters.startDate, filters.endDate, filters.search]);

  return { filters, setFilters, resetFilters, filterParams };
}
