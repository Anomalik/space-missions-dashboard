import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import type { SummaryStats, Mission, PaginatedResponse, ChartDataPoint } from "@/types";

interface DashboardData {
  summary: SummaryStats | null;
  missionsOverTime: ChartDataPoint[];
  successOverTime: ChartDataPoint[];
  topCompanies: ChartDataPoint[];
  successByCompany: ChartDataPoint[];
  statusBreakdown: ChartDataPoint[];
  launchesByCountry: ChartDataPoint[];
  tableData: PaginatedResponse<Mission> | null;
  companies: string[];
  statuses: string[];
  isLoading: boolean;
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
    successOverTime: [],
    topCompanies: [],
    successByCompany: [],
    statusBreakdown: [],
    launchesByCountry: [],
    tableData: null,
    companies: [],
    statuses: [],
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = { ...filterParams };

      const [
        summary,
        missionsOverTime,
        successOverTime,
        topCompanies,
        successByCompany,
        statusBreakdown,
        launchesByCountry,
        tableData,
        companies,
        statuses,
      ] = await Promise.all([
        fetchApi<SummaryStats>("/api/summary", params),
        fetchApi<{ data: ChartDataPoint[] }>("/api/charts/missions-over-time", params),
        fetchApi<{ data: ChartDataPoint[] }>("/api/charts/success-over-time", params),
        fetchApi<{ data: ChartDataPoint[] }>("/api/charts/top-companies", { ...params, n: 10 }),
        fetchApi<{ data: ChartDataPoint[] }>("/api/charts/success-by-company", { ...params, n: 10 }),
        fetchApi<{ data: ChartDataPoint[] }>("/api/charts/status-breakdown", params),
        fetchApi<{ data: ChartDataPoint[] }>("/api/charts/launches-by-country", { ...params, n: 15 }),
        fetchApi<PaginatedResponse<Mission>>("/api/missions", {
          ...params,
          page: tablePage,
          page_size: tablePageSize,
          sort_by: tableSortBy,
          sort_order: tableSortOrder,
        }),
        fetchApi<{ data: string[] }>("/api/companies"),
        fetchApi<{ data: string[] }>("/api/statuses"),
      ]);

      setData({
        summary,
        missionsOverTime: missionsOverTime.data,
        successOverTime: successOverTime.data,
        topCompanies: topCompanies.data,
        successByCompany: successByCompany.data,
        statusBreakdown: statusBreakdown.data,
        launchesByCountry: launchesByCountry.data,
        tableData,
        companies: companies.data,
        statuses: statuses.data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch data",
      }));
    }
  }, [filterParams, tablePage, tablePageSize, tableSortBy, tableSortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
