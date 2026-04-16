import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "@tremor/react";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function SuccessRateByCompany({ data, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Success Rate by Company</CardTitle>
        <CardDescription>Mission success percentage for top companies</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <BarChart
            className="h-[300px]"
            data={data}
            index="company"
            categories={["success_rate"]}
            colors={["emerald"]}
            showLegend={false}
            showAnimation
            layout="vertical"
            yAxisWidth={120}
            valueFormatter={(v: number) => `${v}%`}
          />
        )}
      </CardContent>
    </Card>
  );
}
