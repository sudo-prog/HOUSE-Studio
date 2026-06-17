import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sun, Package, Droplets, Thermometer, DollarSign, Compass, Building, LayoutDashboard, Wind, Leaf } from "lucide-react";
import SolarDesigner from "@/components/tools/SolarDesigner";
import MaterialsEstimator from "@/components/tools/MaterialsEstimator";
import RainwaterCalculator from "@/components/tools/RainwaterCalculator";
import InsulationWizard from "@/components/tools/InsulationWizard";
import BudgetPlanner from "@/components/tools/BudgetPlanner";
import SiteOrientationAnalyzer from "@/components/tools/SiteOrientationAnalyzer";
import StructuralLoadCalc from "@/components/tools/StructuralLoadCalc";
import SpacePlanner from "@/components/tools/SpacePlanner";
import VentilationCalc from "@/components/tools/VentilationCalc";
import FoodGardenPlanner from "@/components/tools/FoodGardenPlanner";

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
    id: "orientation",
    label: "Site Orientation",
    icon: Compass,
    color: "text-sky-500",
    badge: "Pro",
    description: "Optimise your building's rotation for passive solar gain, daylighting & overheating risk.",
  },
  {
    id: "structure",
    label: "Structural Loads",
    icon: Building,
    color: "text-stone-600",
    badge: "Pro",
    description: "Calculate roof & floor loads, select beam sizes, and size your foundations.",
  },
  {
    id: "spaces",
    label: "Space Planner",
    icon: LayoutDashboard,
    color: "text-violet-500",
    badge: "Easy",
    description: "Build your room program, track net vs. gross area, and fit your target floor plate.",
  },
  {
    id: "ventilation",
    label: "Ventilation",
    icon: Wind,
    color: "text-cyan-500",
    badge: "Pro",
    description: "Size natural ventilation openings for comfort without mechanical cooling.",
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
    id: "garden",
    label: "Food Garden",
    icon: Leaf,
    color: "text-emerald-600",
    badge: "Easy",
    description: "Calculate beds, water & compost needed to grow a share of your household's food.",
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
          <Badge className="bg-accent/20 text-accent border-accent/30">10 Tools</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Professional-grade calculators used by architects and engineers — tuned so anyone can build their dream off-grid home.
          All calculations run instantly in your browser, no account required.
        </p>
        <div className="flex gap-2 pt-1">
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Pro = Architect-level</Badge>
          <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Easy = Novice-friendly</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tool picker grid — 5 cols on desktop, 2 on mobile */}
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
          <Badge variant="outline" className="ml-auto shrink-0">
            {active.badge === "Easy" ? "Beginner Friendly" : "Professional"}
          </Badge>
        </div>

        {/* Tool panels */}
        <TabsContent value="solar"        className="mt-0"><SolarDesigner /></TabsContent>
        <TabsContent value="orientation"  className="mt-0"><SiteOrientationAnalyzer /></TabsContent>
        <TabsContent value="structure"    className="mt-0"><StructuralLoadCalc /></TabsContent>
        <TabsContent value="spaces"       className="mt-0"><SpacePlanner /></TabsContent>
        <TabsContent value="ventilation"  className="mt-0"><VentilationCalc /></TabsContent>
        <TabsContent value="materials"    className="mt-0"><MaterialsEstimator /></TabsContent>
        <TabsContent value="rainwater"    className="mt-0"><RainwaterCalculator /></TabsContent>
        <TabsContent value="insulation"   className="mt-0"><InsulationWizard /></TabsContent>
        <TabsContent value="garden"       className="mt-0"><FoodGardenPlanner /></TabsContent>
        <TabsContent value="budget"       className="mt-0"><BudgetPlanner /></TabsContent>
      </Tabs>
    </div>
  );
}
