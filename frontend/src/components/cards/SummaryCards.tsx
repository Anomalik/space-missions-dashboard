import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Target, Activity, Trophy } from "lucide-react";
import type { SummaryStats } from "@/types";

interface SummaryCardsProps {
  stats: SummaryStats | null;
  isLoading: boolean;
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Missions",
      value: stats?.total_missions.toLocaleString() ?? "-",
      icon: Rocket,
      description: "All recorded launches",
    },
    {
      title: "Success Rate",
      value: stats ? `${stats.success_rate}%` : "-",
      icon: Target,
      description: "Successful missions",
    },
    {
      title: "Active Rockets",
      value: stats?.active_rockets.toLocaleString() ?? "-",
      icon: Activity,
      description: "Currently in service",
    },
    {
      title: "Top Company",
      value: stats?.top_company ?? "-",
      icon: Trophy,
      description: stats ? `${stats.top_company_count.toLocaleString()} missions` : "",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isLoading ? "animate-pulse" : ""}`}>
              {isLoading ? "..." : card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
