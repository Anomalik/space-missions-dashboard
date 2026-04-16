import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DecadeDataPoint {
  decade: string;
  [country: string]: string | number;
}

interface Props {
  data: DecadeDataPoint[];
  countries: string[];
  isLoading: boolean;
}

// Sequenced from bright to muted — each country is visually distinct
const COUNTRY_COLORS: Record<string, string> = {
  Russia:     "#3cd7ff",  // bright cyan
  USA:        "#6366f1",  // indigo
  China:      "#a78bfa",  // soft purple
  Kazakhstan: "#f59e0b",  // amber
  France:     "#0891b2",  // deep teal
  Japan:      "#2dd4bf",  // mint
  India:      "#34d399",  // emerald
  Other:      "#475569",  // slate
};

const FALLBACK_COLORS = ["#3cd7ff", "#6366f1", "#a78bfa", "#f59e0b", "#0891b2", "#475569"];

function getColor(country: string, index: number): string {
  return COUNTRY_COLORS[country] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function LaunchesByDecade({ data, countries, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-full min-h-[288px] flex items-center justify-center text-outline text-[11px] font-label uppercase tracking-widest">
        Loading telemetry...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3c494e30" vertical={false} />
        <XAxis
          dataKey="decade"
          tick={{ fill: "#859398", fontSize: 10 }}
          axisLine={{ stroke: "#3c494e40" }}
          tickLine={false}
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [Number(value).toLocaleString(), name]}
          itemSorter={(item) => {
            const idx = countries.indexOf(item.dataKey as string);
            return idx === -1 ? -1 : countries.length - idx;
          }}
        />
        <Legend
          content={() => (
            <div className="flex items-center justify-center gap-4 pt-3">
              {countries.map((country, i) => (
                <div key={country} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getColor(country, i) }}
                  />
                  <span className="text-[10px] text-on-surface-variant">{country}</span>
                </div>
              ))}
            </div>
          )}
        />
        {countries.map((country, i) => (
          <Bar
            key={country}
            dataKey={country}
            stackId="a"
            fill={getColor(country, i)}
            animationDuration={800}
            radius={i === countries.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
