import { useListProjects } from "@workspace/api-client-react";
import { ProjectCard, ProjectSkeleton } from "@/components/projects/ProjectCard";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { Search, Filter, TreePine } from "lucide-react";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { Button } from "@/components/ui/button";

const BIOMES = [
  "All Biomes",
  "Desert", 
  "Temperate Forest", 
  "Tropical", 
  "Mediterranean", 
  "Arctic", 
  "Urban", 
  "Coastal"
];

const PHASES = [
  "All Phases",
  "concept",
  "planning",
  "design",
  "build",
  "complete"
];

export default function ProjectsList() {
  const { data: projects, isLoading } = useListProjects();
  const [search, setSearch] = useState("");
  const [biomeFilter, setBiomeFilter] = useState("All Biomes");
  const [phaseFilter, setPhaseFilter] = useState("All Phases");

  const filteredProjects = projects?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesBiome = biomeFilter === "All Biomes" || p.biome === biomeFilter;
    const matchesPhase = phaseFilter === "All Phases" || p.phase === phaseFilter;
    return matchesSearch && matchesBiome && matchesPhase;
  });

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Habitat Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and evolve your regenerative designs.</p>
        </div>
        <NewProjectDialog trigger={
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        } />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9 bg-background/50" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={biomeFilter} onValueChange={setBiomeFilter}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Biome" />
          </SelectTrigger>
          <SelectContent>
            {BIOMES.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            {PHASES.map(p => (
              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <TreePine className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif">No projects found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {search || biomeFilter !== "All Biomes" || phaseFilter !== "All Phases" 
                ? "Try adjusting your filters to find what you're looking for." 
                : "Start your first habitat design project to see it here."}
            </p>
          </div>
          <NewProjectDialog trigger={
            <Button variant="outline">Start New Project</Button>
          } />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Plus } from "lucide-react";
