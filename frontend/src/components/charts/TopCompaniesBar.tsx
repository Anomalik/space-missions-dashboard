import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "@tremor/react";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function TopCompaniesBar({ data, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Companies by Missions</CardTitle>
        <CardDescription>Companies with the most launches</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <BarChart
            className="h-[300px]"
            data={data}
            index="company"
            categories={["missions"]}
            colors={["blue"]}
            showLegend={false}
            showAnimation
            layout="vertical"
            yAxisWidth={120}
          />
        )}
      </CardContent>
    </Card>
  );
}
