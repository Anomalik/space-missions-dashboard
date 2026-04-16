import type { ChartDataPoint } from "@/types";

interface Props {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export function TopCompaniesBar({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-outline text-[11px] font-label uppercase tracking-widest">
        Loading telemetry...
      </div>
    );
  }

  const maxMissions = data.length > 0 ? Math.max(...data.map((d) => d.missions as number)) : 1;

  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const pct = ((d.missions as number) / maxMissions) * 100;
        const opacity = Math.max(0.3, 1 - i * 0.07);
        return (
          <div key={d.company as string} className="group">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              <span>{d.company as string}</span>
              <span className="text-primary">{(d.missions as number).toLocaleString()}</span>
            </div>
            <div className="h-3 bg-surface-container-lowest w-full relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary-container h-full transition-all duration-1000 group-hover:brightness-125"
                style={{ width: `${pct}%`, opacity }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
