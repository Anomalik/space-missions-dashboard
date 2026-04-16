import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import type { SummaryStats, Mission, PaginatedResponse, ChartDataPoint } from "@/types";

interface DecadeDataPoint {
  decade: string;
  [country: string]: string | number;
}

interface DashboardData {
  summary: SummaryStats | null;
  missionsOverTime: ChartDataPoint[];
  topCompanies: ChartDataPoint[];
  successByCompany: ChartDataPoint[];
  statusBreakdown: ChartDataPoint[];
  launchesByDecade: DecadeDataPoint[];
  decadeCountries: string[];
  tableData: PaginatedResponse<Mission> | null;
  companies: string[];
  statuses: string[];
  isLoading: boolean;
  isTableLoading: boolean;
  error: string | null;
}

interface FilterParams {
  company: string | null;
  statuses: string | null;
  start_date: string | null;
  end_date: string | null;
  search: string | null;
}

export function useDashboardData(
  filterParams: FilterParams,
  tablePage: number = 1,
  tablePageSize: number = 50,
  tableSortBy: string | null = null,
  tableSortOrder: string = "asc"
) {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    missionsOverTime: [],
    topCompanies: [],
    successByCompany: [],
    statusBreakdown: [],
    launchesByDecade: [],
    decadeCountries: [],
    tableData: null,
    companies: [],
    statuses: [],
    isLoading: true,
    isTableLoading: true,
    error: null,
  });

  const filterKey = JSON.stringify(filterParams);
  const tableKey = JSON.stringify({ filterParams, tablePage, tablePageSize, tableSortBy, tableSortOrder });
  const chartAbortRef = useRef<AbortController | null>(null);
  const tableAbortRef = useRef<AbortController | null>(null);

  // Fetch charts, summary, and filter options — only when filters change
  useEffect(() => {
    if (chartAbortRef.current) chartAbortRef.current.abort();
    chartAbortRef.current = new AbortController();
    let cancelled = false;

    async function fetchCharts() {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const params = { ...filterParams };

        const [
          summary,
          missionsOverTime,
          topCompanies,
          successByCompany,
          statusBreakdown,
          launchesByDecade,
          companies,
          statuses,
        ] = await Promise.all([
          fetchApi<SummaryStats>("/api/summary", params),
          fetchApi<{ data: ChartDataPoint[] }>("/api/charts/missions-over-time", params),
          fetchApi<{ data: ChartDataPoint[] }>("/api/charts/top-companies", { ...params, n: 5 }),
          fetchApi<{ data: ChartDataPoint[] }>("/api/charts/success-by-company", { ...params, n: 10 }),
          fetchApi<{ data: ChartDataPoint[] }>("/api/charts/status-breakdown", params),
          fetchApi<{ data: DecadeDataPoint[]; countries: string[] }>("/api/charts/launches-by-decade", params),
          fetchApi<{ data: string[] }>("/api/companies"),
          fetchApi<{ data: string[] }>("/api/statuses"),
        ]);

        if (cancelled) return;

        setData((prev) => ({
          ...prev,
          summary,
          missionsOverTime: missionsOverTime.data,
          topCompanies: topCompanies.data,
          successByCompany: successByCompany.data,
          statusBreakdown: statusBreakdown.data,
          launchesByDecade: launchesByDecade.data,
          decadeCountries: launchesByDecade.countries,
          companies: companies.data,
          statuses: statuses.data,
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to fetch data",
        }));
      }
    }

    fetchCharts();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Fetch table data — when filters OR pagination/sort change
  useEffect(() => {
    if (tableAbortRef.current) tableAbortRef.current.abort();
    tableAbortRef.current = new AbortController();
    let cancelled = false;

    async function fetchTable() {
      setData((prev) => ({ ...prev, isTableLoading: true }));

      try {
        const tableData = await fetchApi<PaginatedResponse<Mission>>("/api/missions", {
          ...filterParams,
          page: tablePage,
          page_size: tablePageSize,
          sort_by: tableSortBy,
          sort_order: tableSortOrder,
        });

        if (cancelled) return;

        setData((prev) => ({
          ...prev,
          tableData,
          isTableLoading: false,
        }));
      } catch (err) {
        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          isTableLoading: false,
          error: err instanceof Error ? err.message : "Failed to fetch table data",
        }));
      }
    }

    fetchTable();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableKey]);

  return data;
}
