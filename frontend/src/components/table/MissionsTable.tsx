import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
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

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Success: "default",
  Failure: "destructive",
  "Partial Failure": "secondary",
  "Prelaunch Failure": "outline",
};

const COLUMNS = [
  { key: "Company", label: "Company", sortable: true },
  { key: "Mission", label: "Mission", sortable: true },
  { key: "Date", label: "Date", sortable: true },
  { key: "Rocket", label: "Rocket", sortable: true },
  { key: "MissionStatus", label: "Status", sortable: true },
  { key: "RocketStatus", label: "Rocket Status", sortable: true },
  { key: "Location", label: "Location", sortable: false },
  { key: "Price", label: "Price (M)", sortable: true },
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

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchChange(searchInput);
    }
  };

  const handleSort = (column: string) => {
    if (currentSort === column) {
      onSortChange(column, currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(column, "asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search missions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => onSearchChange(searchInput)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows:</span>
          <Select
            value={String(data?.page_size || 50)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead key={col.key}>
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-foreground cursor-pointer"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="text-center py-8 text-muted-foreground">
                  No missions found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((mission, i) => (
                <TableRow key={`${mission.Mission}-${i}`}>
                  <TableCell className="font-medium">{mission.Company}</TableCell>
                  <TableCell>{mission.Mission}</TableCell>
                  <TableCell>{mission.Date}</TableCell>
                  <TableCell>{mission.Rocket}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[mission.MissionStatus] || "secondary"}>
                      {mission.MissionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mission.RocketStatus === "Active" ? "default" : "outline"}>
                      {mission.RocketStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{mission.Location}</TableCell>
                  <TableCell>{mission.Price ? `$${mission.Price}M` : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((data.page - 1) * data.page_size) + 1} to{" "}
            {Math.min(data.page * data.page_size, data.total)} of{" "}
            {data.total.toLocaleString()} missions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => onPageChange(data.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.total_pages}
              onClick={() => onPageChange(data.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
