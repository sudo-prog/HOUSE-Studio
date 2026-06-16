import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUpdateProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronRight, Loader2 } from "lucide-react";

const PHASES = [
  {
    id: "concept",
    label: "Concept",
    emoji: "💡",
    tagline: "Dream & site study",
    color: "bg-blue-500",
    lightColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
  },
  {
    id: "planning",
    label: "Planning",
    emoji: "📐",
    tagline: "Permits & consultant team",
    color: "bg-purple-500",
    lightColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-400",
  },
  {
    id: "design",
    label: "Design",
    emoji: "✏️",
    tagline: "Drawings & specifications",
    color: "bg-accent",
    lightColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "build",
    label: "Build",
    emoji: "🔨",
    tagline: "On-site construction",
    color: "bg-orange-500",
    lightColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-700 dark:text-orange-400",
  },
  {
    id: "complete",
    label: "Complete",
    emoji: "🌿",
    tagline: "Move in & monitor",
    color: "bg-green-600",
    lightColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
  },
];

interface Props {
  projectId: number;
  currentPhase: string;
}

export default function PhaseTimeline({ projectId, currentPhase }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProject = useUpdateProject();
  const [advancing, setAdvancing] = useState(false);

  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);
  const current = PHASES[currentIdx] ?? PHASES[0];
  const nextPhase = PHASES[currentIdx + 1];

  const advancePhase = async () => {
    if (!nextPhase) return;
    setAdvancing(true);
    try {
      await updateProject.mutateAsync({
        id: projectId,
        data: { phase: nextPhase.id },
      });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      toast({ title: `Phase advanced to ${nextPhase.label} ${nextPhase.emoji}`, description: nextPhase.tagline });
    } catch {
      toast({ title: "Failed to update phase", variant: "destructive" });
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {PHASES.map((phase, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isFuture = i > currentIdx;
          return (
            <div key={phase.id} className="flex items-center flex-1 min-w-0">
              {/* Step node */}
              <div className={cn(
                "flex flex-col items-center gap-1 px-1 flex-shrink-0",
              )}>
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  isDone
                    ? "bg-green-600 border-green-600 text-white"
                    : isCurrent
                    ? `${phase.color} border-transparent text-white shadow-lg ring-4 ring-offset-1 ring-offset-background ring-${phase.color}/30`
                    : "bg-muted border-border/50 text-muted-foreground"
                )}>
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : <span>{phase.emoji}</span>}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[10px] font-semibold leading-tight",
                    isCurrent ? phase.textColor : isDone ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
                  )}>
                    {phase.label}
                  </p>
                </div>
              </div>
              {/* Connector */}
              {i < PHASES.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-1 rounded-full transition-all",
                  i < currentIdx ? "bg-green-500" : "bg-border/50"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase callout + advance */}
      <div className={cn("flex items-center justify-between p-3 rounded-xl border", current.lightColor)}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">{current.emoji}</span>
            <p className={cn("text-sm font-bold", current.textColor)}>{current.label} Phase</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{current.tagline}</p>
        </div>
        {nextPhase ? (
          <Button
            size="sm"
            onClick={advancePhase}
            disabled={advancing}
            className="gap-1.5 text-xs shrink-0 bg-primary/90 hover:bg-primary"
          >
            {advancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
            {advancing ? "Saving…" : `→ ${nextPhase.label}`}
          </Button>
        ) : (
          <Badge className="bg-green-600 text-white">Complete 🌿</Badge>
        )}
      </div>
    </div>
  );
}
