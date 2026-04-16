import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function SuccessRateByCompany({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-32 flex items-center justify-center text-outline text-[11px] font-label uppercase tracking-widest">
        Loading telemetry...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {data.map((d) => {
        const rate = d.success_rate as number;
        const borderColor = rate >= 90
          ? "border-primary-container"
          : rate >= 80
          ? "border-primary"
          : "border-secondary-container";

        return (
          <div
            key={d.company as string}
            className={`p-4 bg-surface-container-lowest border-t-2 ${borderColor}`}
          >
            <p className="text-[10px] text-outline uppercase truncate">{d.company as string}</p>
            <p className="text-xl font-headline font-bold">{rate}%</p>
          </div>
        );
      })}
    </div>
  );
}
