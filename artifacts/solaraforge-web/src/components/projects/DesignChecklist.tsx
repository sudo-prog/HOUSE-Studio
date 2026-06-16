import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  pro?: boolean;
}

interface PhaseChecklist {
  phase: string;
  label: string;
  emoji: string;
  items: ChecklistItem[];
}

const CHECKLISTS: PhaseChecklist[] = [
  {
    phase: "concept",
    label: "Concept",
    emoji: "💡",
    items: [
      { id: "site-visit", label: "Conduct site survey & topographic analysis" },
      { id: "solar-orientation", label: "Determine optimal solar orientation (south-facing in N. hemisphere)", detail: "Use the Solar Designer tool" },
      { id: "biome-study", label: "Research local biome, climate zone & rainfall data" },
      { id: "budget-first-pass", label: "Establish rough total budget with 20% contingency", detail: "Use Budget Planner" },
      { id: "moodboard", label: "Generate SolaraSpec moodboard from your vision", detail: "Use the Studio tab" },
      { id: "precedent", label: "Research 3+ precedent buildings in your biome" },
      { id: "utilities", label: "Check availability of grid, water, sewage at boundary" },
      { id: "planning-pre-app", label: "Submit planning pre-application enquiry with council" },
    ],
  },
  {
    phase: "planning",
    label: "Planning",
    emoji: "📐",
    items: [
      { id: "structural-eng", label: "Appoint structural engineer experienced with natural materials", pro: true },
      { id: "planning-app", label: "Submit full planning application with heritage/ecology reports" },
      { id: "material-sources", label: "Shortlist local suppliers for key structural materials", detail: "Hemp, lime, timber, clay" },
      { id: "rainwater-calc", label: "Complete rainwater & greywater system sizing", detail: "Use Rainwater Harvester tool" },
      { id: "insulation-spec", label: "Specify insulation system for each element", detail: "Use Insulation Wizard tool" },
      { id: "solar-pv-scheme", label: "Prepare solar PV schematic and battery sizing" },
      { id: "ecology-assessment", label: "Ecology survey & biodiversity net gain report" },
      { id: "thermal-model", label: "Run simplified thermal model (PHPP / SAP or equivalent)", pro: true },
    ],
  },
  {
    phase: "design",
    label: "Design",
    emoji: "✏️",
    items: [
      { id: "floor-plan", label: "Finalise floor plan with scale drawings (1:50 minimum)" },
      { id: "section-elevation", label: "Produce building sections and all elevations" },
      { id: "detail-drawings", label: "Critical junction details — wall-roof, floor-wall, windows", pro: true },
      { id: "materials-schedule", label: "Produce full materials schedule with quantities & suppliers" },
      { id: "solar-final", label: "Finalise PV layout, inverter spec, battery & monitoring system" },
      { id: "rainwater-design", label: "Design first-flush diverter, tank, filtration & pump system" },
      { id: "mep-design", label: "Design mechanical, electrical & plumbing systems (HRV/ERV)" },
      { id: "bim-model", label: "3D model complete and checked for clashes", pro: true },
      { id: "tender", label: "Issue tender to 3+ contractors with bill of quantities" },
    ],
  },
  {
    phase: "build",
    label: "Build",
    emoji: "🔨",
    items: [
      { id: "site-setup", label: "Site setup — hoarding, welfare, materials storage, waste management" },
      { id: "foundation", label: "Foundation / slab constructed and certified" },
      { id: "dpc", label: "Damp-proof course / moisture barrier installed" },
      { id: "structure", label: "Primary structure erected and plumbed/levelled" },
      { id: "roof-watertight", label: "Roof structure and waterproof membrane installed" },
      { id: "wall-fill", label: "Wall infill (hempcrete / straw bale / cob) completed" },
      { id: "mep-roughin", label: "Electrical, plumbing & ventilation rough-in complete" },
      { id: "insulation-install", label: "Insulation installed & air-tightness tested (target <1 ACH @ 50Pa)", pro: true },
      { id: "solar-install", label: "Solar PV array, inverter & battery system commissioned" },
      { id: "rainwater-install", label: "Rainwater tank, filtration & pump commissioned" },
      { id: "plaster-finishes", label: "Lime plaster, floor finishes & joinery installed" },
      { id: "building-control", label: "Building control sign-off and completion certificate" },
    ],
  },
  {
    phase: "complete",
    label: "Complete",
    emoji: "🌿",
    items: [
      { id: "commissioning", label: "Commission all systems — HRV, solar, rainwater, heating" },
      { id: "handover", label: "Produce owner's manual with system operation guides" },
      { id: "post-occupancy", label: "Set up energy monitoring dashboard (kWh/day by circuit)" },
      { id: "water-monitor", label: "Install water-use meter and tank-level sensor" },
      { id: "soil-test", label: "Baseline soil carbon test in garden / food forest area", pro: true },
      { id: "air-test-final", label: "Final airtightness test and certification", pro: true },
      { id: "photo-record", label: "Professional photography for community showcase" },
      { id: "share-learnings", label: "Share build journal and lessons learned with SolaraForge community" },
    ],
  },
];

function useChecklist(projectId: number) {
  const key = `checklist-${projectId}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "{}");
    } catch {
      return {};
    }
  });

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  return { checked, toggle };
}

interface Props {
  projectId: number;
  currentPhase: string;
}

export default function DesignChecklist({ projectId, currentPhase }: Props) {
  const { checked, toggle } = useChecklist(projectId);
  const [expandedPhase, setExpandedPhase] = useState(currentPhase);

  // Auto-expand to current phase when it changes
  useEffect(() => {
    setExpandedPhase(currentPhase);
  }, [currentPhase]);

  const totalItems = CHECKLISTS.reduce((a, ph) => a + ph.items.length, 0);
  const completedItems = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((completedItems / totalItems) * 100);

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-base">Design Checklist</CardTitle>
          <Badge variant="outline" className={cn("text-xs", pct === 100 ? "text-green-700 border-green-300" : "")}>
            {completedItems}/{totalItems} · {pct}%
          </Badge>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className={cn("h-1.5 rounded-full transition-all duration-500", pct === 100 ? "bg-green-500" : "bg-accent")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <CardDescription className="text-xs">Professional design-to-build checklist. Stored locally per project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {CHECKLISTS.map(phaseList => {
          const phaseChecked = phaseList.items.filter(it => checked[it.id]).length;
          const isExpanded = expandedPhase === phaseList.phase;
          const isCurrentPhase = phaseList.phase === currentPhase;
          return (
            <div key={phaseList.phase} className={cn(
              "rounded-xl border overflow-hidden",
              isCurrentPhase ? "border-accent/40" : "border-border/30"
            )}>
              <button
                onClick={() => setExpandedPhase(isExpanded ? "" : phaseList.phase)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left",
                  isExpanded ? "bg-muted/60" : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{phaseList.emoji}</span>
                  <span className="text-sm font-semibold">{phaseList.label}</span>
                  {isCurrentPhase && (
                    <Badge className="bg-accent/15 text-accent border-accent/30 text-[9px] px-1.5 py-0">current</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{phaseChecked}/{phaseList.items.length}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 py-2 space-y-1 border-t border-border/20 bg-background/30">
                  {phaseList.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-start gap-2.5 py-1.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
                    >
                      {checked[item.id]
                        ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-muted-foreground" />}
                      <div className="min-w-0">
                        <p className={cn(
                          "text-xs leading-snug",
                          checked[item.id] ? "line-through text-muted-foreground/60" : "text-foreground/90"
                        )}>
                          {item.label}
                          {item.pro && <span className="ml-1.5 text-[9px] font-bold text-blue-500 border border-blue-300/50 rounded px-1 py-0.5 not-italic">PRO</span>}
                        </p>
                        {item.detail && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.detail}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
