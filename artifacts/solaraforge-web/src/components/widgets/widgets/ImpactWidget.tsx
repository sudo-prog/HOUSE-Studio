import { useListProjects, useGetProjectStats } from "@workspace/api-client-react";
import { Leaf, TreePine, Car, Droplets, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImpactWidget() {
  const { data: projects } = useListProjects();
  const { data: stats } = useGetProjectStats();

  const totalCarbon = stats?.totalCarbonSaved ?? 0;
  const avgSolarScore = Number(stats?.avgSolarScore ?? 0);
  const totalWater = projects?.reduce((acc, p) => acc + (p.waterHarvesting ?? 0), 0) ?? 0;
  const totalProjects = stats?.totalProjects ?? 0;
  const isNegative = totalCarbon < 0;

  const items = [
    {
      emoji: "🌳",
      label: "Trees Equivalent",
      value: Math.max(0, Math.round(Math.abs(totalCarbon) / 21)).toLocaleString(),
      desc: "Annual CO₂ absorbed",
      color: "text-green-700",
      bg: "bg-green-50 border-green-200/50",
    },
    {
      emoji: "🚗",
      label: "Car Journeys Offset",
      value: Math.max(0, Math.round(Math.abs(totalCarbon) / 120)).toLocaleString(),
      desc: "Avg car trips avoided",
      color: "text-primary",
      bg: "bg-primary/5 border-primary/20",
    },
    {
      emoji: "💧",
      label: "Water Harvested",
      value: `${(totalWater / 1000).toFixed(1)}kL`,
      desc: "Annual rainwater capacity",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200/50",
    },
    {
      emoji: "☀️",
      label: "Solar Efficiency",
      value: `${avgSolarScore.toFixed(0)}%`,
      desc: `Across ${totalProjects} project${totalProjects !== 1 ? "s" : ""}`,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200/50",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Status banner */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
        isNegative
          ? "bg-green-50 text-green-700 border border-green-200/50"
          : "bg-amber-50 text-amber-700 border border-amber-200/50"
      )}>
        <Leaf className="h-3.5 w-3.5 shrink-0" />
        {isNegative
          ? `Your projects are carbon negative — sequestering ${Math.abs(totalCarbon).toFixed(1)} kg CO₂`
          : totalProjects === 0
            ? "Create your first project to see your environmental impact"
            : `Projects currently emit ${totalCarbon.toFixed(1)} kg CO₂ — add hempcrete or straw bale to go negative`
        }
      </div>

      {/* Impact grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {items.map(item => (
          <div key={item.label} className={cn("flex flex-col items-center justify-center text-center p-3 rounded-xl border", item.bg)}>
            <span className="text-2xl mb-1">{item.emoji}</span>
            <p className={cn("text-xl font-bold font-serif leading-none", item.color)}>{item.value}</p>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mt-1">{item.label}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
