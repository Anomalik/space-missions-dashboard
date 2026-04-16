import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Success: "#3cd7ff",
  Failure: "#ef4444",
  "Partial Failure": "#f59e0b",
  "Prelaunch Failure": "#64748b",
};

export function StatusBreakdown({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-outline text-[11px] font-label uppercase tracking-widest">
        Loading telemetry...
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.count as number), 0);

  return (
    <div className="flex flex-col flex-1">
      {/* Donut */}
      <div className="relative flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              strokeWidth={0}
              animationDuration={1000}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status as string}
                  fill={STATUS_COLORS[entry.status as string] || "#859398"}
                />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: 20 }}
              contentStyle={{
                backgroundColor: "#1d2026",
                border: "1px solid #3c494e40",
                borderRadius: 6,
                color: "#e1e2eb",
                fontSize: 12,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                Number(value).toLocaleString(),
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-headline font-bold text-on-surface">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
        {data.map((d) => {
          const status = d.status as string;
          const count = d.count as number;
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
          return (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[status] || "#859398" }}
              />
              <span className="text-[10px] text-on-surface-variant truncate">{status}</span>
              <span className="text-[10px] font-bold text-on-surface ml-auto tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
