import { 
  useGetProject, 
  useUpdateProject,
  useDeleteProject,
  getListProjectsQueryKey, 
  getGetProjectQueryKey,
  useListMaterials,
} from "@workspace/api-client-react";
import AICollaborator from "@/components/ai/AICollaborator";
import { useParams, Link } from "wouter";
import { 
  Sun, 
  Droplets, 
  DollarSign, 
  Info, 
  Database, 
  LayoutDashboard,
  Loader2,
  Trash2,
  Edit2,
  Boxes,
  ExternalLink,
  CheckSquare,
  Leaf,
  ImagePlus,
} from "lucide-react";
import { MoodboardTab } from "@/components/projects/MoodboardTab";
import PhaseTimeline from "@/components/projects/PhaseTimeline";
import DesignChecklist from "@/components/projects/DesignChecklist";
import { ExportSpecButton } from "@/components/projects/ExportSpec";
import EditProjectDialog from "@/components/projects/EditProjectDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MaterialCard, getProjectMaterials, removeMaterialFromProject } from "@/components/materials/MaterialCard";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteProject = useDeleteProject();
  const { data: project, isLoading } = useGetProject(projectId, { 
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) } 
  });

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync({ id: projectId });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project deleted", description: project?.name });
      navigate("/projects");
    } catch {
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };
  
  if (isLoading) return <ProjectDetailSkeleton />;
  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <span className="text-6xl">🌿</span>
      <h2 className="font-serif text-2xl font-bold">Project not found</h2>
      <p className="text-muted-foreground">This habitat may have been deleted or doesn't exist.</p>
      <Button onClick={() => navigate("/projects")} className="bg-primary text-primary-foreground">Back to Projects</Button>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-4xl font-bold">{project.name}</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)} title="Edit project">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {project.biome}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {project.phase}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ExportSpecButton project={project} />
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Build View</Button>
        </div>
      </div>

      {/* Phase Timeline — always visible */}
      <PhaseTimeline projectId={project.id} currentPhase={project.phase ?? "concept"} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50 h-11 p-1 flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="viewer" className="gap-2">
            <Boxes className="h-4 w-4" /> Viewer
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            <Database className="h-4 w-4" /> Materials
          </TabsTrigger>
          <TabsTrigger value="moodboard" className="gap-2">
            <ImagePlus className="h-4 w-4" /> Moodboard
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <CheckSquare className="h-4 w-4" /> Checklist
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Leaf className="h-4 w-4" /> AI Collaborator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              label="Solar Score" 
              value={`${project.solarScore ?? 0}%`} 
              icon={Sun} 
              color="text-accent"
              description="Efficiency & orientation"
            />
            <MetricCard 
              label="Embodied Carbon" 
              value={`${project.embodiedCarbon ?? 0} kg`} 
              icon={Leaf} 
              color={project.embodiedCarbon && project.embodiedCarbon < 0 ? "text-green-600" : "text-amber-600"}
              description="CO₂e net impact"
            />
            <MetricCard 
              label="Water Harvesting" 
              value={`${project.waterHarvesting ?? 0} L`} 
              icon={Droplets} 
              color="text-blue-500"
              description="Annual capacity"
            />
            <MetricCard 
              label="Est. Cost" 
              value={`$${(project.estimatedCost ?? 0).toLocaleString()}`} 
              icon={DollarSign} 
              color="text-primary"
              description="Projected investment"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="font-serif">Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.description || "No description provided yet."}
                </p>
              </CardContent>
            </Card>

            <SavedMaterialsPanel projectId={project.id} />
          </div>
        </TabsContent>

        <TabsContent value="viewer" className="mt-0">
          <HabitatViewer project={project} />
        </TabsContent>

        <TabsContent value="materials" className="mt-0">
          <MaterialsBrowser />
        </TabsContent>

        <TabsContent value="moodboard" className="mt-0">
          <MoodboardTab project={project} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-0">
          <DesignChecklist projectId={project.id} currentPhase={project.phase ?? "concept"} />
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <AICollaborator project={project} />
        </TabsContent>
      </Tabs>

      <EditProjectDialog project={project} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its checklist data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SavedMaterialsPanel({ projectId }: { projectId: number }) {
  const { data: allMaterials } = useListMaterials({});
  const [savedIds, setSavedIds] = useState<number[]>(() => getProjectMaterials(projectId));

  const savedMaterials = (allMaterials ?? []).filter(m => savedIds.includes(m.id));

  const remove = (materialId: number) => {
    removeMaterialFromProject(projectId, materialId);
    setSavedIds(prev => prev.filter(id => id !== materialId));
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-serif text-lg">Selected Materials</CardTitle>
        <Link href="/materials">
          <Button variant="ghost" size="sm" className="h-7 text-primary text-xs">
            Browse →
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {savedMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border border-dashed">
            <Database className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground px-4">
              No materials saved yet. Browse the library and click <strong>"Save to Project"</strong> on any material.
            </p>
            <Link href="/materials" className="mt-3">
              <Button variant="outline" size="sm" className="text-xs">Open Materials Library</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {savedMaterials.map(m => {
              const isNeg = m.embodiedCarbon < 0;
              return (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/30 bg-background/40 group">
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.category}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] shrink-0", isNeg ? "text-green-700 border-green-200" : "text-amber-700 border-amber-200")}>
                    {m.embodiedCarbon} kg
                  </Badge>
                  <button
                    onClick={() => remove(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              {savedMaterials.length} material{savedMaterials.length !== 1 ? "s" : ""} · Open any material card to add more
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HabitatViewer({ project }: { project: { name: string; biome?: string | null; solarScore?: number | null } }) {
  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-serif flex items-center gap-2">
          <Boxes className="h-5 w-5 text-accent" />
          2D / 3D Habitat Viewer
        </CardTitle>
        <Badge variant="outline" className="text-xs border-accent/30 text-accent">
          Preview
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        {/* Three.js canvas placeholder — interactive 3D viewer coming in next release */}
        <div
          data-testid="habitat-viewer-canvas"
          className="relative w-full bg-gradient-to-br from-primary/10 via-background to-accent/5 border-t border-border/30"
          style={{ height: 400 }}
        >
          {/* Isometric grid lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="iso-grid" x="0" y="0" width="60" height="34.6" patternUnits="userSpaceOnUse">
                <path d="M30 0 L60 17.3 L30 34.6 L0 17.3 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#iso-grid)" />
          </svg>

          {/* Stylised habitat silhouette */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center px-8">
            <div className="relative">
              {/* House shape SVG */}
              <svg viewBox="0 0 200 160" className="w-48 h-36 text-primary/40 drop-shadow-xl" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                {/* Roof */}
                <polygon points="100,10 180,70 20,70" fill="currentColor" opacity="0.5" />
                {/* Living roof plants */}
                <circle cx="80" cy="55" r="8" fill="#4a7c59" opacity="0.7" />
                <circle cx="100" cy="48" r="10" fill="#3d6b4a" opacity="0.7" />
                <circle cx="120" cy="55" r="7" fill="#4a7c59" opacity="0.7" />
                {/* Walls */}
                <rect x="40" y="70" width="120" height="80" fill="currentColor" opacity="0.35" rx="2" />
                {/* Window */}
                <rect x="60" y="90" width="30" height="25" fill="#e8a020" opacity="0.6" rx="2" />
                <rect x="110" y="90" width="30" height="25" fill="#e8a020" opacity="0.6" rx="2" />
                {/* Door */}
                <rect x="85" y="115" width="30" height="35" fill="#c4714a" opacity="0.7" rx="2" />
                {/* Solar panels on roof */}
                <rect x="108" y="38" width="18" height="12" fill="#4a9fd4" opacity="0.8" rx="1" />
                <rect x="128" y="44" width="18" height="12" fill="#4a9fd4" opacity="0.8" rx="1" />
              </svg>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <Sun className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-serif text-lg font-bold text-foreground/80">{project.name}</p>
              {project.biome && (
                <Badge variant="secondary" className="text-xs">{project.biome}</Badge>
              )}
              <p className="text-xs text-muted-foreground max-w-xs">
                Interactive Three.js 3D viewer — renders parametric habitat geometry from SolaraSpec data. Full 3D coming in next release.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/studio">
                <Button variant="outline" size="sm" className="rounded-full border-accent/30 text-accent hover:bg-accent/10 gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Generate SolaraSpec
                </Button>
              </Link>
            </div>
          </div>

          {/* Solar score overlay */}
          {project.solarScore && (
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur rounded-xl px-3 py-2 shadow-md border border-border/40">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Solar Score</p>
              <p className="text-xl font-bold text-accent">{project.solarScore}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, icon: Icon, color, description }: any) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="text-2xl font-serif font-bold">{value}</div>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function MaterialsBrowser() {
  const [cat, setCat] = useState("All");
  const { data: materials, isLoading } = useListMaterials({
    category: cat === "All" ? undefined : cat
  });

  const categories = ["All", "Wall Systems", "Structure", "Insulation", "Finishes", "Flooring", "Roofing"];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(c => (
          <Button 
            key={c} 
            variant={cat === c ? "default" : "outline"} 
            size="sm" 
            onClick={() => setCat(c)}
            className="rounded-full"
          >
            {c}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
        ) : (
          materials?.map(m => <MaterialCard key={m.id} material={m} />)
        )}
      </div>
    </div>
  );
}


function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="col-span-2 h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
