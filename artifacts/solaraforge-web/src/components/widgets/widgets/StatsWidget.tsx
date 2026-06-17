import { useListProjects, useGetProjectStats } from "@workspace/api-client-react";
import { Sun, Leaf, Droplets, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatsWidget() {
  const { data: projects } = useListProjects();
  const { data: stats } = useGetProjectStats();

  const totalCarbon = stats?.totalCarbonSaved ?? 0;
  const avgSolarScore = Number(stats?.avgSolarScore ?? 0);
  const totalWater = projects?.reduce((acc, p) => acc + (p.waterHarvesting ?? 0), 0) ?? 0;

  const items = [
    { label: "Projects", value: stats?.totalProjects ?? 0, icon: TreePine, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Solar Score", value: `${avgSolarScore.toFixed(1)}%`, icon: Sun, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Carbon Sequestered", value: `${Math.abs(totalCarbon).toFixed(1)} kg`, icon: Leaf, color: "text-green-600", bg: "bg-green-50" },
    { label: "Water Capacity", value: `${totalWater.toLocaleString()} L`, icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className={cn("p-2 rounded-lg shrink-0", item.bg)}>
            <item.icon className={cn("h-4 w-4", item.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{item.label}</p>
            <p className="text-lg font-bold font-serif truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
