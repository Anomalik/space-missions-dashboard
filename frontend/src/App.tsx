import { useState, useCallback, useEffect, useRef } from "react";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { FilterBar } from "@/components/filters/FilterBar";
import { SummaryCards } from "@/components/cards/SummaryCards";
import { FleetStatus } from "@/components/cards/FleetStatus";
import { MissionsOverTime } from "@/components/charts/MissionsOverTime";
import { TopCompaniesBar } from "@/components/charts/TopCompaniesBar";
import { SuccessRateByCompany } from "@/components/charts/SuccessRateByCompany";
import { StatusBreakdown } from "@/components/charts/StatusBreakdown";
import { LaunchesByDecade } from "@/components/charts/LaunchesByDecade";
import { MissionsTable } from "@/components/table/MissionsTable";
import { useFilters } from "@/hooks/useFilters";
import { useDashboardData } from "@/hooks/useDashboardData";

function Dashboard() {
  const { filters, setFilters, resetFilters, filterParams } = useFilters();

  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(15);
  const [tableSortBy, setTableSortBy] = useState<string | null>(null);
  const [tableSortOrder, setTableSortOrder] = useState("asc");

  const data = useDashboardData(filterParams, tablePage, tablePageSize, tableSortBy, tableSortOrder);

  // Live backend health check — polls every 30s
  const [backendStatus, setBackendStatus] = useState<"nominal" | "offline" | "checking">("checking");
  const healthTimer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const check = () => {
      fetch(`${API_BASE}/api/health`, { method: "GET" })
        .then((r) => setBackendStatus(r.ok ? "nominal" : "offline"))
        .catch(() => setBackendStatus("offline"));
    };
    check();
    healthTimer.current = setInterval(check, 30_000);
    return () => clearInterval(healthTimer.current);
  }, []);

  const handlePageChange = useCallback((page: number) => setTablePage(page), []);
  const handlePageSizeChange = useCallback((size: number) => {
    setTablePageSize(size);
    setTablePage(1);
  }, []);
  const handleSortChange = useCallback((column: string, order: string) => {
    setTableSortBy(column);
    setTableSortOrder(order);
  }, []);
  const handleSearchChange = useCallback((search: string) => {
    setFilters({ search });
    setTablePage(1);
  }, [setFilters]);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full bg-secondary/[0.02] blur-3xl" />
      </div>

      {/* ── Full-Width Top Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-container/10">
              <span className="material-symbols-outlined text-primary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <div>
              <h1 className="font-headline font-black tracking-widest text-primary-container uppercase text-sm leading-none">Astraeus</h1>
              <p className="text-[8px] uppercase tracking-[0.2em] text-outline leading-none mt-0.5">Command</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FilterBar
              filters={filters}
              companies={data.companies}
              statuses={data.statuses}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2" title={backendStatus === "nominal" ? "Backend connected" : backendStatus === "offline" ? "Backend unreachable" : "Checking connection..."}>
              <span className={`text-[9px] font-label font-medium uppercase tracking-widest ${backendStatus === "nominal" ? "text-primary" : backendStatus === "offline" ? "text-error" : "text-outline"}`}>
                {backendStatus === "nominal" ? "Nominal" : backendStatus === "offline" ? "Offline" : "Connecting"}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${backendStatus === "nominal" ? "bg-primary-container" : backendStatus === "offline" ? "bg-error" : "bg-outline"}`} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-[1920px] mx-auto pt-24 pb-12 px-8 space-y-8">

        {data.error && (
          <div className="bg-error-container/10 p-4 text-error text-sm">
            Failed to load data: {data.error}. Make sure the backend is running.
          </div>
        )}

        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight mb-1">Mission Control</h2>
          <p className="text-outline text-sm">Real-time intelligence from the celestial perimeter.</p>
        </div>

        {/* 1. KPI Summary Cards */}
        <SummaryCards stats={data.summary} isLoading={data.isLoading} />

        {/* 2. Hero Row: Missions Over Time (8/12) + Status Breakdown (4/12) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-5 bg-primary-container" />
              <h3 className="font-headline text-lg font-bold">Missions Over Time</h3>
            </div>
            <div className="flex-1 min-h-[288px]">
              <MissionsOverTime data={data.missionsOverTime} isLoading={data.isLoading} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-primary-container" />
              <h3 className="font-headline text-lg font-bold">Status Breakdown</h3>
            </div>
            <StatusBreakdown data={data.statusBreakdown} isLoading={data.isLoading} />
          </div>
        </div>

        {/* 3. Company Row: Top 5 Companies (5/12) + Launches by Decade stacked (7/12) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-5 bg-primary-container" />
              <h3 className="font-headline text-lg font-bold">Top Companies</h3>
            </div>
            <TopCompaniesBar data={data.topCompanies} isLoading={data.isLoading} />
          </div>

          <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-5 bg-primary-container" />
              <h3 className="font-headline text-lg font-bold">Launches by Decade</h3>
            </div>
            <div className="flex-1 min-h-[280px]">
              <LaunchesByDecade data={data.launchesByDecade} countries={data.decadeCountries} isLoading={data.isLoading} />
            </div>
          </div>
        </div>

        {/* 4. Success Rate by Company */}
        <div className="bg-surface-container-low p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-5 bg-primary-container" />
            <h3 className="font-headline text-lg font-bold">Success Rate by Company</h3>
          </div>
          <SuccessRateByCompany data={data.successByCompany} isLoading={data.isLoading} />
        </div>

        {/* 5. Mission Status Distribution */}
        <FleetStatus data={data.statusBreakdown} isLoading={data.isLoading} />

        {/* 6. Mission Database Table */}
        <MissionsTable
          data={data.tableData}
          isLoading={data.isLoading}
          search={filters.search}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          currentSort={tableSortBy}
          currentSortOrder={tableSortOrder}
        />

        {/* Footer */}
        <footer className="flex justify-between items-center text-[10px] font-label text-outline uppercase tracking-[0.2em] opacity-40 pt-8">
          <div className="flex gap-8">
            <span>Dataset: 1957–2022</span>
            <span>Source: Space Missions CSV</span>
          </div>
          <span>Astraeus Command</span>
        </footer>

      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
