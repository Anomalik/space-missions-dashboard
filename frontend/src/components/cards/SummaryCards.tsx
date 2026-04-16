import type { SummaryStats } from "@/types";

interface SummaryCardsProps {
  stats: SummaryStats | null;
  isLoading: boolean;
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  const loading = isLoading || !stats;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Missions */}
      <div className="bg-surface-container-low p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Total Missions</p>
        <div className="flex justify-between items-end">
          <span className="text-4xl font-headline font-bold text-on-surface">
            {loading ? "..." : stats.total_missions.toLocaleString()}
          </span>
          <span className="material-symbols-outlined text-primary/40 text-2xl">database</span>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-surface-container-low p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Success Rate</p>
        <div className="flex justify-between items-end">
          <span className="text-4xl font-headline font-bold text-on-surface">
            {loading ? "..." : `${stats.success_rate}%`}
          </span>
          {!loading && (
            <div className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${stats.success_rate}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Active Rockets */}
      <div className="bg-surface-container-low p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Active Rockets</p>
        <div className="flex justify-between items-end">
          <span className="text-4xl font-headline font-bold text-on-surface">
            {loading ? "..." : stats.active_rockets.toLocaleString()}
          </span>
          <span className="material-symbols-outlined text-primary/40 text-2xl">rocket_launch</span>
        </div>
      </div>

      {/* Top Entity */}
      <div className="bg-surface-container-low p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-secondary" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Top Entity</p>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-headline font-bold text-on-surface">
            {loading ? "..." : stats.top_company}
          </span>
          {!loading && (
            <span className="text-[10px] bg-secondary-container/20 text-secondary px-2 py-0.5 rounded border border-secondary/20">
              {stats.top_company_count.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
