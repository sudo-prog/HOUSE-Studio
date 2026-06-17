import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Material, useListProjects } from "@workspace/api-client-react";
import { Leaf, Info, Bookmark, BookmarkCheck, ChevronDown, GitCompareArrows, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// --- localStorage helpers for favorites ---
const FAVORITES_KEY = "sf-material-favorites";

export function getFavorites(): number[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"); } catch { return []; }
}

export function toggleFavorite(id: number): number[] {
  const current = getFavorites();
  const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

// --- localStorage helpers for project ↔ material associations ---
function getSavedMaterials(projectId: number): number[] {
  try {
    return JSON.parse(localStorage.getItem(`project-materials-${projectId}`) ?? "[]");
  } catch {
    return [];
  }
}

export function saveMaterialToProject(projectId: number, materialId: number): void {
  const current = getSavedMaterials(projectId);
  if (!current.includes(materialId)) {
    localStorage.setItem(`project-materials-${projectId}`, JSON.stringify([...current, materialId]));
  }
}

export function removeMaterialFromProject(projectId: number, materialId: number): void {
  const current = getSavedMaterials(projectId);
  localStorage.setItem(`project-materials-${projectId}`, JSON.stringify(current.filter(id => id !== materialId)));
}

export function getProjectMaterials(projectId: number): number[] {
  return getSavedMaterials(projectId);
}

// --- Save to Project button (inside dialog) ---
function SaveToProjectButton({ materialId, materialName }: { materialId: number; materialName: string }) {
  const { data: projects } = useListProjects();
  const { toast } = useToast();
  const [savedProjects, setSavedProjects] = useState<number[]>(() => {
    return (projects ?? []).filter(p => getSavedMaterials(p.id).includes(materialId)).map(p => p.id);
  });

  const handleSave = (projectId: number, projectName: string) => {
    if (savedProjects.includes(projectId)) {
      removeMaterialFromProject(projectId, materialId);
      setSavedProjects(prev => prev.filter(id => id !== projectId));
      toast({ title: `Removed from "${projectName}"`, description: materialName });
    } else {
      saveMaterialToProject(projectId, materialId);
      setSavedProjects(prev => [...prev, projectId]);
      toast({ title: `Saved to "${projectName}"`, description: materialName });
    }
  };

  if (!projects?.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 w-full mt-4",
            savedProjects.length > 0 ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100" : ""
          )}
        >
          {savedProjects.length > 0
            ? <><BookmarkCheck className="h-4 w-4" /> Saved to {savedProjects.length} project{savedProjects.length > 1 ? "s" : ""}</>
            : <><Bookmark className="h-4 w-4" /> Save to Project</>}
          <ChevronDown className="h-3 w-3 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Your Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map(p => {
          const isSaved = savedProjects.includes(p.id);
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => handleSave(p.id, p.name)}
              className={cn("gap-2 cursor-pointer", isSaved ? "text-green-700" : "")}
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4 shrink-0" /> : <Bookmark className="h-4 w-4 shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{p.biome ?? "Unknown biome"} · {p.phase}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Main card component ---
interface MaterialCardProps {
  material: Material;
  showDetails?: boolean;
  isComparing?: boolean;
  onToggleCompare?: (id: number) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export function MaterialCard({ material, showDetails = false, isComparing, onToggleCompare, isFavorited, onToggleFavorite }: MaterialCardProps) {
  const isNegativeCarbon = material.embodiedCarbon < 0;

  const CardBody = (
    <Card className={cn(
      "overflow-hidden transition-all border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col relative",
      !showDetails && "hover:shadow-md cursor-pointer group",
      isComparing && "ring-2 ring-accent ring-offset-1"
    )}>
      {/* Compare toggle — only shown when onToggleCompare is provided */}
      {onToggleCompare && (
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); onToggleCompare(material.id); }}
          className={cn(
            "absolute top-2 left-2 z-10 h-7 w-7 rounded-full flex items-center justify-center border transition-all shadow-sm",
            isComparing
              ? "bg-accent border-accent text-accent-foreground"
              : "bg-card/90 border-border/60 text-muted-foreground hover:border-accent/50 hover:text-accent"
          )}
          title={isComparing ? "Remove from comparison" : "Add to comparison"}
        >
          <GitCompareArrows className="h-3.5 w-3.5" />
        </button>
      )}
      {/* Favorite star — only shown when onToggleFavorite is provided */}
      {onToggleFavorite && (
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); onToggleFavorite(material.id); }}
          className={cn(
            "absolute top-2 z-10 h-7 w-7 rounded-full flex items-center justify-center border transition-all shadow-sm",
            onToggleCompare ? "left-10" : "left-2",
            isFavorited
              ? "bg-amber-400 border-amber-400 text-white"
              : "bg-card/90 border-border/60 text-muted-foreground hover:border-amber-400/60 hover:text-amber-500"
          )}
          title={isFavorited ? "Remove from favourites" : "Add to favourites"}
        >
          <Star className="h-3.5 w-3.5" fill={isFavorited ? "currentColor" : "none"} />
        </button>
      )}
      {material.imageUrl && (
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img 
            src={material.imageUrl} 
            alt={material.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-primary border-none">
            {material.category}
          </Badge>
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif font-bold text-base group-hover:text-primary transition-colors">
            {material.name}
          </h3>
          <Badge 
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 whitespace-nowrap",
              isNegativeCarbon 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {material.embodiedCarbon} kg CO₂e
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {material.description}
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap gap-1">
            {material.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50">
                {tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <span className="text-[9px] text-muted-foreground self-center">
                +{material.tags.length - 3}
              </span>
            )}
          </div>
          
          {showDetails && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
              <div className="text-[10px]">
                <span className="text-muted-foreground block">Durability</span>
                <span className="font-medium">{material.durabilityYears} years</span>
              </div>
              <div className="text-[10px]">
                <span className="text-muted-foreground block">Recyclability</span>
                <span className="font-medium">{material.recyclability}%</span>
              </div>
              <div className="text-[10px] col-span-2">
                <span className="text-muted-foreground block">Availability</span>
                <span className="font-medium">{material.localAvailability}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (showDetails) return CardBody;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {CardBody}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-none p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="bg-muted aspect-square md:aspect-auto h-full">
            {material.imageUrl && (
              <img 
                src={material.imageUrl} 
                alt={material.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <Badge variant="outline" className="mb-2 text-primary border-primary/20">
              {material.category}
            </Badge>
            <DialogHeader className="mb-4">
              <DialogTitle className="font-serif text-3xl font-bold">
                {material.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {material.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Embodied Carbon</span>
                  <span className={cn(
                    "text-sm font-bold",
                    isNegativeCarbon ? "text-green-600" : "text-amber-600"
                  )}>
                    {material.embodiedCarbon} kg CO₂e/unit
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Durability</span>
                  <span className="text-sm font-bold">
                    {material.durabilityYears} Years
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Recyclability</span>
                  <span className="text-sm font-bold">
                    {material.recyclability}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Availability</span>
                  <span className="text-sm font-bold truncate">
                    {material.localAvailability}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-2">Properties & Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Save to Project */}
              <div className="border-t border-border/30 pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Save this material to a project</p>
                <SaveToProjectButton materialId={material.id} materialName={material.name} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MaterialSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse border-border/50 bg-card/50">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-muted rounded-full" />
          <div className="h-4 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </Card>
  );
}
