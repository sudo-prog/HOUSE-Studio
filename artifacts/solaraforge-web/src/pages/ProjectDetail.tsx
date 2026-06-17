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
  NotebookPen,
  Clock,
  Save,
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
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState("overview");
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href).then(() =>
                toast({ title: "Link copied!", description: "Project URL is in your clipboard." })
              );
            }}
            title="Copy link to this project"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Share
          </Button>
          <ExportSpecButton project={project} />
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
            onClick={() => setActiveTab("viewer")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Build View
          </Button>
        </div>
      </div>

      {/* Phase Timeline — always visible */}
      <PhaseTimeline projectId={project.id} currentPhase={project.phase ?? "concept"} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
          <TabsTrigger value="notes" className="gap-2">
            <NotebookPen className="h-4 w-4" /> Notes
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

        <TabsContent value="notes" className="mt-0">
          <ProjectNotes projectId={project.id} projectName={project.name} />
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

type ViewMode = "floor" | "elevation" | "site";

function HabitatViewer({ project }: { project: { name: string; biome?: string | null; solarScore?: number | null } }) {
  const [view, setView] = useState<ViewMode>("floor");

  const biomeColor = {
    "Desert": "#c4a882",
    "Temperate Forest": "#6b8f5e",
    "Tropical": "#4a8c5c",
    "Coastal": "#5b8fa8",
    "Mediterranean": "#d4a96a",
    "Mountain": "#8a9bb0",
    "Urban": "#8a8a8a",
    "Arctic": "#b0c8d4",
    "Prairie / Grassland": "#b0a05e",
  }[project.biome ?? ""] ?? "#6b8f5e";

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-serif flex items-center gap-2">
          <Boxes className="h-5 w-5 text-accent" />
          Habitat Viewer
        </CardTitle>
        <div className="flex items-center gap-2">
          {(["floor", "elevation", "site"] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "text-[10px] px-2.5 py-1 rounded-full border font-semibold capitalize transition-all",
                view === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/30"
              )}
            >
              {v === "floor" ? "Floor Plan" : v === "elevation" ? "Elevation" : "Site Plan"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          data-testid="habitat-viewer-canvas"
          className="relative w-full border-t border-border/30 bg-gradient-to-br from-muted/30 via-background to-muted/10"
          style={{ height: 420 }}
        >
          {view === "floor" && (
            <svg viewBox="0 0 600 420" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                </pattern>
              </defs>
              <rect width="600" height="420" fill="url(#grid)" />

              {/* Outer walls */}
              <rect x="80" y="50" width="440" height="320" fill="#f5f0e8" stroke="#1a3a2a" strokeWidth="8" rx="4" />

              {/* Rooms */}
              {/* Living Room */}
              <rect x="84" y="54" width="200" height="155" fill="#eef5ee" stroke="#1a3a2a" strokeWidth="2" />
              <text x="184" y="132" textAnchor="middle" fontSize="11" fill="#1a3a2a" fontWeight="600" opacity="0.7">Living Room</text>
              <text x="184" y="147" textAnchor="middle" fontSize="9" fill="#6b8f5e" opacity="0.6">~32 m²</text>

              {/* Kitchen */}
              <rect x="284" y="54" width="236" height="155" fill="#f0f5ef" stroke="#1a3a2a" strokeWidth="2" />
              <text x="402" y="132" textAnchor="middle" fontSize="11" fill="#1a3a2a" fontWeight="600" opacity="0.7">Kitchen / Dining</text>
              <text x="402" y="147" textAnchor="middle" fontSize="9" fill="#6b8f5e" opacity="0.6">~28 m²</text>

              {/* Bedroom 1 */}
              <rect x="84" y="209" width="145" height="157" fill="#eef0f5" stroke="#1a3a2a" strokeWidth="2" />
              <text x="156" y="288" textAnchor="middle" fontSize="11" fill="#1a3a2a" fontWeight="600" opacity="0.7">Bedroom 1</text>
              <text x="156" y="303" textAnchor="middle" fontSize="9" fill="#6b8f5e" opacity="0.6">~18 m²</text>
              {/* Bed symbol */}
              <rect x="100" y="220" width="56" height="34" fill="#c4d4e8" stroke="#8a9bb0" strokeWidth="1" rx="3" opacity="0.8" />
              <rect x="100" y="220" width="56" height="10" fill="#8a9bb0" rx="2" opacity="0.5" />

              {/* Bedroom 2 */}
              <rect x="229" y="209" width="145" height="157" fill="#eef0f5" stroke="#1a3a2a" strokeWidth="2" />
              <text x="301" y="288" textAnchor="middle" fontSize="11" fill="#1a3a2a" fontWeight="600" opacity="0.7">Bedroom 2</text>
              <text x="301" y="303" textAnchor="middle" fontSize="9" fill="#6b8f5e" opacity="0.6">~16 m²</text>
              <rect x="243" y="220" width="48" height="30" fill="#c4d4e8" stroke="#8a9bb0" strokeWidth="1" rx="3" opacity="0.8" />
              <rect x="243" y="220" width="48" height="9" fill="#8a9bb0" rx="2" opacity="0.5" />

              {/* Bathroom */}
              <rect x="374" y="209" width="90" height="80" fill="#e8f2f8" stroke="#1a3a2a" strokeWidth="2" />
              <text x="419" y="252" textAnchor="middle" fontSize="10" fill="#1a3a2a" fontWeight="600" opacity="0.7">Bath</text>
              {/* Bath symbol */}
              <ellipse cx="419" cy="237" rx="22" ry="14" fill="none" stroke="#5b8fa8" strokeWidth="1.5" opacity="0.6" />

              {/* Utility room */}
              <rect x="374" y="289" width="90" height="77" fill="#f0ede8" stroke="#1a3a2a" strokeWidth="2" />
              <text x="419" y="332" textAnchor="middle" fontSize="9" fill="#1a3a2a" fontWeight="600" opacity="0.7">Utility</text>

              {/* Greenhouse / Sunspace */}
              <rect x="464" y="209" width="52" height="157" fill="#fffbea" stroke="#e8a020" strokeWidth="2" strokeDasharray="4,2" />
              <text x="490" y="285" textAnchor="middle" fontSize="9" fill="#e8a020" fontWeight="700" opacity="0.9" transform="rotate(-90, 490, 285)">Sunspace</text>

              {/* Door openings */}
              <line x1="184" y1="209" x2="234" y2="209" stroke="#f5f0e8" strokeWidth="6" />
              <line x1="84" y1="155" x2="84" y2="180" stroke="#f5f0e8" strokeWidth="6" />

              {/* Solar panels on roof (shown as overlay) */}
              <rect x="290" y="60" width="220" height="100" fill="none" stroke="#4a9fd4" strokeWidth="1" strokeDasharray="3,2" opacity="0.4" rx="2" />
              {[0,1,2,3,4].map(i => (
                <rect key={i} x={298 + i * 43} y={68} width={36} height={84} fill="#4a9fd4" opacity="0.15" stroke="#4a9fd4" strokeWidth="0.5" rx="1" />
              ))}
              <text x="400" y="170" textAnchor="middle" fontSize="9" fill="#4a9fd4" fontWeight="600" opacity="0.7">Solar Array</text>

              {/* North indicator */}
              <g transform="translate(545, 80)">
                <circle cx="0" cy="0" r="18" fill="white" stroke="#1a3a2a" strokeWidth="1.5" opacity="0.9" />
                <polygon points="0,-12 -5,6 0,3 5,6" fill="#1a3a2a" opacity="0.8" />
                <polygon points="0,12 -5,-6 0,-3 5,-6" fill="#c8c8c8" opacity="0.8" />
                <text x="0" y="-16" textAnchor="middle" fontSize="8" fill="#1a3a2a" fontWeight="700">N</text>
              </g>

              {/* Scale bar */}
              <g transform="translate(85, 390)">
                <line x1="0" y1="0" x2="60" y2="0" stroke="#1a3a2a" strokeWidth="1.5" opacity="0.5" />
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#1a3a2a" strokeWidth="1.5" opacity="0.5" />
                <line x1="60" y1="-4" x2="60" y2="4" stroke="#1a3a2a" strokeWidth="1.5" opacity="0.5" />
                <text x="30" y="-6" textAnchor="middle" fontSize="8" fill="#1a3a2a" opacity="0.5">5 m</text>
              </g>

              {/* Label */}
              <text x="300" y="410" textAnchor="middle" fontSize="10" fill="#1a3a2a" opacity="0.4" fontStyle="italic">{project.name} — Floor Plan (conceptual)</text>
            </svg>
          )}

          {view === "elevation" && (
            <svg viewBox="0 0 600 420" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="sky-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill={biomeColor} opacity="0.08" />
                </pattern>
              </defs>
              {/* Sky */}
              <rect width="600" height="290" fill="url(#sky-pattern)" />
              {/* Ground */}
              <rect y="290" width="600" height="130" fill={biomeColor} opacity="0.12" />
              <line x1="0" y1="290" x2="600" y2="290" stroke={biomeColor} strokeWidth="2" opacity="0.4" />

              {/* Main structure */}
              <rect x="80" y="180" width="440" height="110" fill="#f5f0e8" stroke="#1a3a2a" strokeWidth="4" />

              {/* Roof */}
              <polygon points="60,180 300,80 540,180" fill="#1a3a2a" opacity="0.7" />
              {/* Living roof greenery on roof */}
              {[0,1,2,3,4,5,6,7].map(i => (
                <ellipse key={i} cx={120 + i * 46} cy={155 + Math.abs(i - 3.5) * 4} rx="18" ry="10" fill={biomeColor} opacity="0.6" />
              ))}

              {/* Solar panels */}
              {[0,1,2,3,4].map(i => (
                <rect key={i} x={160 + i * 55} y={115 + i * 12} width={48} height={28} fill="#4a9fd4" opacity="0.7" rx="2" />
              ))}

              {/* Windows */}
              <rect x="110" y="200" width="60" height="50" fill="#e8a020" opacity="0.5" rx="3" />
              <rect x="210" y="200" width="60" height="50" fill="#e8a020" opacity="0.5" rx="3" />
              <rect x="330" y="200" width="60" height="50" fill="#e8a020" opacity="0.5" rx="3" />
              <rect x="430" y="200" width="60" height="50" fill="#e8a020" opacity="0.5" rx="3" />

              {/* Door */}
              <rect x="265" y="235" width="70" height="55" fill="#c4714a" opacity="0.6" rx="3" />

              {/* Sunspace / Greenhouse on right */}
              <rect x="470" y="180" width="50" height="110" fill="#fffbea" stroke="#e8a020" strokeWidth="2" opacity="0.8" />
              <line x1="470" y1="180" x2="510" y2="150" stroke="#e8a020" strokeWidth="1.5" opacity="0.6" />
              <line x1="520" y1="180" x2="510" y2="150" stroke="#e8a020" strokeWidth="1.5" opacity="0.6" />

              {/* Rainwater cistern */}
              <ellipse cx="560" cy="280" rx="22" ry="14" fill="#5b8fa8" opacity="0.4" />
              <rect x="538" y="266" width="44" height="24" fill="#5b8fa8" opacity="0.3" />
              <text x="560" y="308" textAnchor="middle" fontSize="8" fill="#5b8fa8" opacity="0.8">Cistern</text>

              {/* Vegetation */}
              {[0,1,2].map(i => (
                <g key={i} transform={`translate(${40 + i * 20}, 260)`}>
                  <line x1="0" y1="0" x2="0" y2="30" stroke={biomeColor} strokeWidth="2" opacity="0.6" />
                  <ellipse cx="0" cy="-5" rx="12" ry="18" fill={biomeColor} opacity="0.5" />
                </g>
              ))}

              {/* Label */}
              <text x="300" y="412" textAnchor="middle" fontSize="10" fill="#1a3a2a" opacity="0.4" fontStyle="italic">{project.name} — South Elevation (conceptual)</text>
            </svg>
          )}

          {view === "site" && (
            <svg viewBox="0 0 600 420" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Site background */}
              <rect width="600" height="420" fill={biomeColor} opacity="0.08" />

              {/* Plot boundary */}
              <rect x="40" y="30" width="520" height="360" fill="none" stroke="#1a3a2a" strokeWidth="1.5" strokeDasharray="8,4" opacity="0.3" rx="4" />

              {/* Building footprint */}
              <rect x="160" y="110" width="260" height="180" fill="#f5f0e8" stroke="#1a3a2a" strokeWidth="3" rx="3" opacity="0.9" />
              <text x="290" y="205" textAnchor="middle" fontSize="11" fill="#1a3a2a" fontWeight="600" opacity="0.7">Habitat</text>

              {/* Sunspace on south */}
              <rect x="370" y="260" width="50" height="30" fill="#fffbea" stroke="#e8a020" strokeWidth="1.5" opacity="0.9" />
              <text x="395" y="278" textAnchor="middle" fontSize="8" fill="#e8a020" opacity="0.8">Sun</text>

              {/* Food garden beds */}
              {[0,1,2].map(i => (
                <rect key={i} x={60 + i * 30} y={140 + i * 10} width={55} height={22} fill="#6b8f5e" opacity="0.4" stroke="#4a6a3a" strokeWidth="1" rx="2" />
              ))}
              <text x="85" y="205" textAnchor="middle" fontSize="9" fill="#4a6a3a" opacity="0.8" fontWeight="600">Garden Beds</text>

              {/* Solar panels array */}
              {[0,1,2].map(row => [0,1,2,3].map(col => (
                <rect key={`${row}-${col}`} x={160 + col * 28} y={340 + row * 14} width={24} height={10} fill="#4a9fd4" opacity="0.6" rx="1" />
              )))}
              <text x="218" y="390" textAnchor="middle" fontSize="9" fill="#4a9fd4" opacity="0.8" fontWeight="600">Ground Mount Solar</text>

              {/* Rainwater tank */}
              <circle cx="500" cy="330" r="28" fill="#5b8fa8" opacity="0.25" stroke="#5b8fa8" strokeWidth="2" />
              <circle cx="500" cy="330" r="20" fill="#5b8fa8" opacity="0.2" />
              <text x="500" y="334" textAnchor="middle" fontSize="9" fill="#2d5a7a" fontWeight="600" opacity="0.9">Tank</text>
              <text x="500" y="372" textAnchor="middle" fontSize="8" fill="#5b8fa8" opacity="0.7">18,000 L</text>

              {/* Compost area */}
              <rect x="460" y="80" width="50" height="50" fill="#8b7355" opacity="0.2" stroke="#8b7355" strokeWidth="1.5" rx="3" />
              <text x="485" y="110" textAnchor="middle" fontSize="8" fill="#6b5535" opacity="0.8" fontWeight="600">Compost</text>

              {/* Wind rose / sun path */}
              <g transform="translate(540, 60)">
                <circle cx="0" cy="0" r="30" fill="white" stroke="#1a3a2a" strokeWidth="1" opacity="0.8" />
                <line x1="0" y1="-24" x2="0" y2="24" stroke="#1a3a2a" strokeWidth="1" opacity="0.4" />
                <line x1="-24" y1="0" x2="24" y2="0" stroke="#1a3a2a" strokeWidth="1" opacity="0.4" />
                <polygon points="0,-22 -4,0 0,-4 4,0" fill="#1a3a2a" opacity="0.9" />
                <text x="0" y="-26" textAnchor="middle" fontSize="8" fill="#1a3a2a" fontWeight="700">N</text>
                <text x="0" y="34" textAnchor="middle" fontSize="8" fill="#1a3a2a" opacity="0.5">S</text>
                {/* Sun arc */}
                <path d="M -20 10 Q 0 -28 20 10" fill="none" stroke="#e8a020" strokeWidth="1.5" opacity="0.7" strokeDasharray="3,2" />
                <circle cx="0" cy="-26" r="4" fill="#e8a020" opacity="0.8" />
              </g>

              {/* Footpaths */}
              <line x1="290" y1="290" x2="290" y2="390" stroke="#c4a882" strokeWidth="6" opacity="0.4" strokeLinecap="round" />
              <line x1="80" y1="200" x2="160" y2="200" stroke="#c4a882" strokeWidth="6" opacity="0.4" strokeLinecap="round" />

              {/* Trees */}
              {[[80, 80], [510, 130], [80, 310], [440, 80]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="20" fill={biomeColor} opacity="0.5" />
                  <circle cx={x} cy={y} r="12" fill={biomeColor} opacity="0.4" />
                </g>
              ))}

              {/* Label */}
              <text x="300" y="412" textAnchor="middle" fontSize="10" fill="#1a3a2a" opacity="0.4" fontStyle="italic">{project.name} — Site Plan (conceptual)</text>
            </svg>
          )}

          {/* Solar score overlay */}
          {project.solarScore && (
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur rounded-xl px-3 py-2 shadow-md border border-border/40">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Solar Score</p>
              <p className="text-xl font-bold text-accent">{project.solarScore}%</p>
            </div>
          )}

          {/* Biome badge */}
          {project.biome && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-xs backdrop-blur bg-card/80">{project.biome}</Badge>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between bg-muted/20">
          <p className="text-[10px] text-muted-foreground">Conceptual floor plan · dimensions approximate · generate a SolaraSpec for precise parameters</p>
          <Link href="/studio">
            <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-accent hover:text-accent hover:bg-accent/10">
              <ExternalLink className="h-3 w-3" /> SolaraSpec
            </Button>
          </Link>
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


interface NoteEntry {
  id: string;
  text: string;
  timestamp: number;
  label?: string;
}

function ProjectNotes({ projectId, projectName }: { projectId: number; projectName: string }) {
  const NOTES_KEY = `sf-notes-${projectId}`;
  const loadNotes = () => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]") as NoteEntry[]; } catch { return []; } };

  const [notes, setNotes] = useState<NoteEntry[]>(() => loadNotes());
  const [draft, setDraft] = useState("");
  const [label, setLabel] = useState("");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const persist = useCallback((updated: NoteEntry[]) => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    setNotes(updated);
  }, [NOTES_KEY]);

  const addNote = () => {
    if (!draft.trim()) return;
    const entry: NoteEntry = { id: crypto.randomUUID(), text: draft.trim(), timestamp: Date.now(), label: label.trim() || undefined };
    persist([entry, ...notes]);
    setDraft("");
    setLabel("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    textareaRef.current?.focus();
  };

  const deleteNote = (id: string) => persist(notes.filter(n => n.id !== id));

  const NOTE_PROMPTS = [
    "Site visit observations…",
    "Contractor quote notes…",
    "Material sourcing ideas…",
    "Design decision rationale…",
    "Inspiration & references…",
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif flex items-center gap-2 text-base">
            <NotebookPen className="h-5 w-5 text-accent" />
            Project Journal
          </CardTitle>
          <p className="text-xs text-muted-foreground">Private notes for {projectName} — stored locally in your browser.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Label (optional) — e.g. Site Visit, Quote, Idea"
              className="h-8 text-xs flex-1 border-border/50"
              maxLength={50}
            />
          </div>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addNote(); }}
            placeholder={NOTE_PROMPTS[Math.floor(Date.now() / 86400000) % NOTE_PROMPTS.length]}
            className="w-full min-h-[120px] rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">⌘↵ to save</p>
            <Button
              size="sm"
              onClick={addNote}
              disabled={!draft.trim()}
              className={cn("gap-1.5 h-8 text-xs rounded-full", saved ? "bg-green-600 text-white" : "")}
            >
              {saved ? <><Save className="h-3 w-3" /> Saved!</> : <><Save className="h-3 w-3" /> Add Note</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{notes.length} note{notes.length > 1 ? "s" : ""}</p>
          {notes.map(note => (
            <Card key={note.id} className="border-border/40 bg-card/40 group hover:border-border/80 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {note.label && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 mb-2 font-semibold">{note.label}</Badge>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{note.text}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Clock className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(note.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNote(note.id)}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
            <NotebookPen className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
          <p className="text-xs text-muted-foreground/60 max-w-xs">Add site visit observations, contractor quotes, design decisions — anything worth remembering about this project.</p>
        </div>
      )}
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
