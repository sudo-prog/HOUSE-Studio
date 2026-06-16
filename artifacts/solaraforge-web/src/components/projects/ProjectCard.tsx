import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Project } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASE_ORDER = ["concept", "planning", "design", "build", "complete"];
const PHASE_EMOJIS: Record<string, string> = {
  concept: "💡", planning: "📐", design: "✏️", build: "🔨", complete: "🌿"
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const score = project.solarScore ?? 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border/50 bg-card/50 backdrop-blur-sm">
        {project.thumbnailUrl && (
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={project.thumbnailUrl} 
              alt={project.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-primary border-none">
                {project.biome}
              </Badge>
            </div>
          </div>
        )}
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-lg font-bold leading-tight group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-muted/30"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="text-accent transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {score}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize text-[10px] px-2 py-0">
              {project.phase}
            </Badge>
            {project.embodiedCarbon && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-2 py-0",
                  project.embodiedCarbon < 0 ? "text-green-600 bg-green-50 border-green-200" : "text-amber-600 bg-amber-50 border-amber-200"
                )}
              >
                {project.embodiedCarbon} kg CO₂e
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 space-y-3">
          {/* Phase mini-stepper */}
          <div className="w-full flex items-center gap-0.5">
            {PHASE_ORDER.map((ph, i) => {
              const currentIdx = PHASE_ORDER.indexOf(project.phase ?? "concept");
              const isDone = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={ph} className="flex items-center flex-1 min-w-0" title={ph}>
                  <div className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] border transition-all",
                    isDone ? "bg-green-500 border-green-500 text-white" :
                    isCurrent ? "bg-accent border-accent text-accent-foreground font-bold" :
                    "bg-muted border-border/40 text-muted-foreground/50"
                  )}>
                    {isDone ? "✓" : PHASE_EMOJIS[ph]}
                  </div>
                  {i < PHASE_ORDER.length - 1 && (
                    <div className={cn("flex-1 h-px mx-0.5", i < currentIdx ? "bg-green-400" : "bg-border/40")} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground w-full">
            <span>{project.estimatedCost ? `$${project.estimatedCost.toLocaleString()}` : 'No estimate'}</span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {project.waterHarvesting ?? 0}L
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse border-border/50 bg-card/50">
      <div className="aspect-video bg-muted" />
      <CardHeader className="p-4 pb-2">
        <div className="h-6 w-3/4 bg-muted rounded" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="h-3 w-1/4 bg-muted rounded" />
        <div className="h-3 w-1/4 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
}
