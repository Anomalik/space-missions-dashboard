import type { ChartDataPoint } from "@/types";

interface FleetStatusProps {
  data: ChartDataPoint[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; textColor: string }> = {
  Success:            { color: "bg-primary",    textColor: "text-primary" },
  Failure:            { color: "bg-red-500",     textColor: "text-red-500" },
  "Partial Failure":  { color: "bg-amber-500",  textColor: "text-amber-600 dark:text-amber-400" },
  "Prelaunch Failure":{ color: "bg-slate-500",  textColor: "text-slate-600 dark:text-slate-400" },
};

export function FleetStatus({ data, isLoading }: FleetStatusProps) {
  const total = data.reduce((sum, d) => sum + (d.count as number), 0);

  if (isLoading || total === 0) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-low p-5 h-24" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((d) => {
        const status = d.status as string;
        const count = d.count as number;
        const pct = ((count / total) * 100).toFixed(1);
        const config = STATUS_CONFIG[status] || { color: "bg-outline", textColor: "text-outline" };

        return (
          <div key={status} className="bg-surface-container-low p-5">
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[10px] font-black uppercase ${config.textColor} tracking-widest`}>{status}</span>
              <span className="text-lg font-headline font-bold">{pct}%</span>
            </div>
            <div className="h-1 w-full bg-surface-container-highest">
              <div className={`h-full ${config.color}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[9px] text-slate-500 mt-3">{count.toLocaleString()} missions</p>
          </div>
        );
      })}
    </section>
  );
}
