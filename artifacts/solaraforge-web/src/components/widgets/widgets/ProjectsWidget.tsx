import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { TreePine, ArrowRight, Plus, Leaf, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PHASE_COLORS: Record<string, string> = {
  concept: "bg-purple-100 text-purple-700",
  planning: "bg-blue-100 text-blue-700",
  design: "bg-amber-100 text-amber-700",
  build: "bg-orange-100 text-orange-700",
  complete: "bg-green-100 text-green-700",
};

export default function ProjectsWidget() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-muted-foreground">{projects?.length ?? 0} habitats</p>
        <div className="flex gap-2">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
              All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : projects?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <TreePine className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <Link href="/projects">
              <Button size="sm" className="bg-accent text-accent-foreground gap-1">
                <Plus className="h-3 w-3" /> Start a Habitat
              </Button>
            </Link>
          </div>
        ) : (
          projects?.slice(0, 6).map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/60 hover:border-primary/30 hover:bg-card/90 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{project.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {project.phase && (
                      <Badge className={cn("text-[9px] px-1.5 py-0 capitalize", PHASE_COLORS[project.phase] ?? "bg-muted text-muted-foreground")}>
                        {project.phase}
                      </Badge>
                    )}
                    {project.biome && <span className="text-[10px] text-muted-foreground truncate">{project.biome}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Sun className="h-3 w-3" />
                    <span className="text-xs font-bold">{project.solarScore ?? 0}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {(projects?.length ?? 0) > 3 && (
        <Link href="/projects" className="shrink-0">
          <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1">
            View all {projects?.length} projects <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
  );
}
