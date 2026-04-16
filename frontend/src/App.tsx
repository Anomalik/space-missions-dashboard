import { useState, useCallback } from "react";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { FilterBar } from "@/components/filters/FilterBar";
import { SummaryCards } from "@/components/cards/SummaryCards";
import { MissionsOverTime } from "@/components/charts/MissionsOverTime";
import { SuccessRateOverTime } from "@/components/charts/SuccessRateOverTime";
import { TopCompaniesBar } from "@/components/charts/TopCompaniesBar";
import { SuccessRateByCompany } from "@/components/charts/SuccessRateByCompany";
import { StatusBreakdown } from "@/components/charts/StatusBreakdown";
import { LaunchesByCountry } from "@/components/charts/LaunchesByCountry";
import { MissionsTable } from "@/components/table/MissionsTable";
import { useFilters } from "@/hooks/useFilters";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Separator } from "@/components/ui/separator";

function Dashboard() {
  const { filters, setFilters, resetFilters, filterParams } = useFilters();

  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(50);
  const [tableSortBy, setTableSortBy] = useState<string | null>(null);
  const [tableSortOrder, setTableSortOrder] = useState("asc");

  const data = useDashboardData(filterParams, tablePage, tablePageSize, tableSortBy, tableSortOrder);

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Space Missions Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Historical space mission data from 1957 to 2022
              </p>
            </div>
            <ThemeToggle />
          </div>
          <FilterBar
            filters={filters}
            companies={data.companies}
            statuses={data.statuses}
            onFilterChange={setFilters}
            onReset={resetFilters}
          />
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {data.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
            Failed to load data: {data.error}. Make sure the backend is running.
          </div>
        )}

        <SummaryCards stats={data.summary} isLoading={data.isLoading} />

        <Separator />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <MissionsOverTime data={data.missionsOverTime} isLoading={data.isLoading} />
          <SuccessRateOverTime data={data.successOverTime} isLoading={data.isLoading} />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <TopCompaniesBar data={data.topCompanies} isLoading={data.isLoading} />
          <SuccessRateByCompany data={data.successByCompany} isLoading={data.isLoading} />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <StatusBreakdown data={data.statusBreakdown} isLoading={data.isLoading} />
          <LaunchesByCountry data={data.launchesByCountry} isLoading={data.isLoading} />
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">Mission Data</h2>
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
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        Space Missions Dashboard — Data from 1957 to 2022
      </footer>
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
