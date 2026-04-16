import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarList } from "@tremor/react";
import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function LaunchesByCountry({ data, isLoading }: Props) {
  const barListData = data.map((d) => ({
    name: d.country as string,
    value: d.launches as number,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launches by Country</CardTitle>
        <CardDescription>Geographic distribution of launch sites</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
        ) : (
          <BarList
            data={barListData}
            className="h-[300px]"
            color="blue"
            showAnimation
            valueFormatter={(v: number) => v.toLocaleString()}
          />
        )}
      </CardContent>
    </Card>
  );
}
