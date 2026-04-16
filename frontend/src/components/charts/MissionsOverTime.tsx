import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart } from "@tremor/react";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function MissionsOverTime({ data, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Missions Over Time</CardTitle>
        <CardDescription>Annual launch frequency from 1957 to 2022</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <AreaChart
            className="h-[300px]"
            data={data}
            index="year"
            categories={["missions"]}
            colors={["blue"]}
            showLegend={false}
            showAnimation
            curveType="monotone"
            yAxisWidth={40}
          />
        )}
      </CardContent>
    </Card>
  );
}
