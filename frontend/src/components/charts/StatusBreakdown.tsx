import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DonutChart } from "@tremor/react";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Success: "emerald",
  Failure: "rose",
  "Partial Failure": "amber",
  "Prelaunch Failure": "orange",
};

export function StatusBreakdown({ data, isLoading }: Props) {
  const colors = data.map((d) => STATUS_COLORS[d.status as string] || "gray");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission Status Breakdown</CardTitle>
        <CardDescription>Distribution of mission outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <DonutChart
            className="h-[300px]"
            data={data}
            category="count"
            index="status"
            colors={colors}
            showAnimation
            valueFormatter={(v: number) => v.toLocaleString()}
          />
        )}
      </CardContent>
    </Card>
  );
}
