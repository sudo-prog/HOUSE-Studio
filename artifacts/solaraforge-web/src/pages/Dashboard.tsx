import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles, Plus, LayoutDashboard, Check, Settings2,
  RotateCcw, Leaf, Globe, Workflow,
  BarChart3, TreePine, Sun, Battery, Package, Wrench, Lightbulb,
} from "lucide-react";
import { Link } from "wouter";
import ProjectWizard from "@/components/wizard/ProjectWizard";
import WelcomeDialog from "@/components/onboarding/WelcomeDialog";
import WidgetGrid from "@/components/widgets/WidgetGrid";
import {
  WIDGET_REGISTRY,
  DEFAULT_LAYOUT,
  loadActiveWidgets,
  saveActiveWidgets,
  saveLayout,
} from "@/components/widgets/WidgetRegistry";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  BarChart3, TreePine, Sun, Battery, Leaf, Package, Wrench, Sparkles, Globe,
};

export default function Dashboard() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(loadActiveWidgets);
  const [gridKey, setGridKey] = useState(0);

  const toggleWidget = useCallback((id: string) => {
    const next = activeWidgets.includes(id)
      ? activeWidgets.filter(w => w !== id)
      : [...activeWidgets, id];
    setActiveWidgets(next);
    saveActiveWidgets(next);
    setGridKey(k => k + 1);
  }, [activeWidgets]);

  const resetLayout = () => {
    saveLayout(DEFAULT_LAYOUT);
    saveActiveWidgets(WIDGET_REGISTRY.map(w => w.id));
    setActiveWidgets(WIDGET_REGISTRY.map(w => w.id));
    setGridKey(k => k + 1);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-bold">Mission Control</h1>
          <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">
            Widget Dashboard
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/workflow">
            <Button size="sm" variant="ghost" className="gap-1.5 h-8 text-xs text-muted-foreground">
              <Workflow className="h-3.5 w-3.5" /> Workflow
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWizardOpen(true)}
            className="gap-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> New Project
          </Button>
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(e => !e)}
            className={cn("gap-1.5 h-8 text-xs", isEditing ? "bg-primary text-primary-foreground" : "")}
          >
            {isEditing
              ? <><Check className="h-3.5 w-3.5" /> Done</>
              : <><Settings2 className="h-3.5 w-3.5" /> Customize</>}
          </Button>
        </div>
      </div>

      {/* Edit mode panel */}
      {isEditing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Customize Your Dashboard
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drag widgets to rearrange · Resize from bottom-right corner · Toggle widgets on/off
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetLayout} className="gap-1.5 text-xs h-8 text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {WIDGET_REGISTRY.map(w => {
                const Icon = ICON_MAP[w.icon] ?? Sparkles;
                const active = activeWidgets.includes(w.id);
                return (
                  <button
                    key={w.id}
                    onClick={() => toggleWidget(w.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {w.title}
                    {active && <Check className="h-3 w-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widget grid */}
      <div className={cn("transition-all", isEditing && "ring-2 ring-primary/20 ring-offset-2 rounded-2xl")}>
        <WidgetGrid key={gridKey} isEditing={isEditing} />
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-50">
        <Button
          size="icon"
          onClick={() => setWizardOpen(true)}
          className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-2xl hover:scale-110 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <WelcomeDialog />
    </div>
  );
}
