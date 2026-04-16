import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function MissionsOverTime({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-full min-h-[288px] flex items-center justify-center text-outline text-[11px] font-label uppercase tracking-widest">
        Loading telemetry...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="missionsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3cd7ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3cd7ff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#3c494e30" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: "#859398", fontSize: 10 }}
          axisLine={{ stroke: "#3c494e40" }}
          tickLine={false}
          interval={4}
          padding={{ left: 8, right: 8 }}
        />
        <YAxis
          tick={{ fill: "#859398", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1d2026",
            border: "1px solid #3c494e40",
            borderRadius: 6,
            color: "#e1e2eb",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="missions"
          stroke="#3cd7ff"
          strokeWidth={2}
          fill="url(#missionsFill)"
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
