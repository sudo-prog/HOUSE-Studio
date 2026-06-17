import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const TOOLS = [
  { id: "solar",       emoji: "☀️",  label: "Solar",       href: "/tools" },
  { id: "orientation", emoji: "🧭",  label: "Orientation", href: "/tools" },
  { id: "structure",   emoji: "🏗️",  label: "Structure",   href: "/tools" },
  { id: "spaces",      emoji: "📐",  label: "Spaces",      href: "/tools" },
  { id: "ventilation", emoji: "💨",  label: "Ventilation", href: "/tools" },
  { id: "materials",   emoji: "🧱",  label: "Materials",   href: "/tools" },
  { id: "rainwater",   emoji: "💧",  label: "Rainwater",   href: "/tools" },
  { id: "insulation",  emoji: "🌡️",  label: "Insulation",  href: "/tools" },
  { id: "garden",      emoji: "🌱",  label: "Garden",      href: "/tools" },
  { id: "budget",      emoji: "💰",  label: "Budget",      href: "/tools" },
];

export default function ToolkitWidget() {
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-muted-foreground">10 professional calculators</p>
        <Link href="/tools">
          <span className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
            Open Toolkit <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-5 gap-2 flex-1">
        {TOOLS.map(tool => (
          <Link key={tool.id} href={tool.href}>
            <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-border/40 bg-card/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer h-full text-center">
              <span className="text-xl">{tool.emoji}</span>
              <p className="text-[9px] font-medium text-muted-foreground leading-tight">{tool.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
