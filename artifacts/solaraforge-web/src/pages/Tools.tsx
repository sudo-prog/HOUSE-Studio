import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sun, Package, Droplets, Thermometer, DollarSign } from "lucide-react";
import SolarDesigner from "@/components/tools/SolarDesigner";
import MaterialsEstimator from "@/components/tools/MaterialsEstimator";
import RainwaterCalculator from "@/components/tools/RainwaterCalculator";
import InsulationWizard from "@/components/tools/InsulationWizard";
import BudgetPlanner from "@/components/tools/BudgetPlanner";

const TOOLS = [
  {
    id: "solar",
    label: "Solar Designer",
    icon: Sun,
    color: "text-amber-500",
    badge: "Pro",
    description: "Calculate panel count, tilt angle, annual yield & savings for any site on Earth.",
  },
  {
    id: "materials",
    label: "Materials Estimator",
    icon: Package,
    color: "text-green-600",
    badge: "Pro",
    description: "Compare wall, roof & floor systems — quantities, cost, embodied carbon.",
  },
  {
    id: "rainwater",
    label: "Rainwater Harvester",
    icon: Droplets,
    color: "text-blue-500",
    badge: "Easy",
    description: "Size your roof catchment, tank & filter system for full water independence.",
  },
  {
    id: "insulation",
    label: "Insulation Wizard",
    icon: Thermometer,
    color: "text-orange-500",
    badge: "Pro",
    description: "Match insulation thickness & material to your climate zone for code-plus performance.",
  },
  {
    id: "budget",
    label: "Budget Planner",
    icon: DollarSign,
    color: "text-primary",
    badge: "Easy",
    description: "Full line-item budget tracker — estimated vs actual spend with category breakdown.",
  },
];

export default function Tools() {
  const [activeTab, setActiveTab] = useState("solar");
  const active = TOOLS.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-4xl font-bold text-foreground">Design Toolkit</h1>
          <Badge className="bg-accent/20 text-accent border-accent/30">5 Tools</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Professional-grade calculators used by architects and engineers — tuned so anyone can use them. 
          All calculations happen in your browser, instantly, no account required.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tool picker cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all space-y-2 group ${
                activeTab === tool.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/40 hover:border-primary/30 bg-card/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
                <Badge
                  variant="secondary"
                  className={`text-[9px] px-1.5 py-0 ${
                    tool.badge === "Easy"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                  }`}
                >
                  {tool.badge}
                </Badge>
              </div>
              <p className="text-xs font-bold leading-tight">{tool.label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug hidden md:block">
                {tool.description}
              </p>
            </button>
          ))}
        </div>

        {/* Active tool header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/40">
          <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-sm">
            <active.icon className={`h-5 w-5 ${active.color}`} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold">{active.label}</h2>
            <p className="text-sm text-muted-foreground">{active.description}</p>
          </div>
          <Badge variant="outline" className="ml-auto shrink-0">{active.badge === "Easy" ? "Beginner Friendly" : "Professional"}</Badge>
        </div>

        <TabsContent value="solar" className="mt-0"><SolarDesigner /></TabsContent>
        <TabsContent value="materials" className="mt-0"><MaterialsEstimator /></TabsContent>
        <TabsContent value="rainwater" className="mt-0"><RainwaterCalculator /></TabsContent>
        <TabsContent value="insulation" className="mt-0"><InsulationWizard /></TabsContent>
        <TabsContent value="budget" className="mt-0"><BudgetPlanner /></TabsContent>
      </Tabs>
    </div>
  );
}
