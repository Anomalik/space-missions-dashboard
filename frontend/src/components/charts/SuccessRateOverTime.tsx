import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart } from "@tremor/react";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function SuccessRateOverTime({ data, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Success Rate Over Time</CardTitle>
        <CardDescription>Annual mission success percentage</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <LineChart
            className="h-[300px]"
            data={data}
            index="year"
            categories={["success_rate"]}
            colors={["emerald"]}
            showLegend={false}
            showAnimation
            curveType="monotone"
            yAxisWidth={40}
            valueFormatter={(v: number) => `${v}%`}
          />
        )}
      </CardContent>
    </Card>
  );
}
