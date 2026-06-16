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
import { Search, TreePine, Sparkles, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProjectWizard from "@/components/wizard/ProjectWizard";
import { Link } from "wouter";

const BIOMES = [
  "All Biomes",
  "Desert", 
  "Temperate Forest", 
  "Tropical", 
  "Mediterranean", 
  "Mountain",
  "Arctic", 
  "Urban", 
  "Coastal",
  "Prairie / Grassland",
];

const PHASES = [
  "All Phases",
  "concept",
  "planning",
  "design",
  "build",
  "complete"
];

const TEMPLATES = [
  {
    emoji: "🏔",
    name: "Earthship Loft",
    biome: "Desert",
    size: "95m²",
    budget: "$95k",
    carbon: "Carbon negative",
    tags: ["Off-grid", "Rammed tyre", "Greenhouse"],
    description: "Tyre-and-earth fortress built into the hillside. 100% off-grid solar + wind.",
  },
  {
    emoji: "🏡",
    name: "Tiny Forest Cabin",
    biome: "Temperate Forest",
    size: "25m²",
    budget: "$45k",
    carbon: "+1.2t CO₂",
    tags: ["DIY-friendly", "CLT", "Rocket heater"],
    description: "Compact CLT micro-cabin with loft, composting toilet, and small PV array.",
  },
  {
    emoji: "🚢",
    name: "Container Home",
    biome: "Coastal",
    size: "72m²",
    budget: "$65k",
    carbon: "+3.8t CO₂",
    tags: ["Upcycled", "Industrial", "Living roof"],
    description: "Two 40ft containers with hempcrete infill, living roof, and rooftop solar.",
  },
  {
    emoji: "🌾",
    name: "Straw Bale Cottage",
    biome: "Temperate Forest",
    size: "90m²",
    budget: "$72k",
    carbon: "Carbon negative",
    tags: ["Owner-builder", "Lime render", "Sedum roof"],
    description: "Two-bed straw bale with reclaimed timber frame and triple-glazed windows.",
  },
  {
    emoji: "🏺",
    name: "Cob Cottage",
    biome: "Mediterranean",
    size: "60m²",
    budget: "$38k",
    carbon: "Carbon negative",
    tags: ["Sculpted", "Zero-waste", "Ancient"],
    description: "Hand-sculpted cob with bottle-glass windows, rocket stove, and sunken courtyard.",
  },
  {
    emoji: "🎋",
    name: "Bamboo Longhouse",
    biome: "Tropical",
    size: "60m²",
    budget: "$28k",
    carbon: "Carbon negative",
    tags: ["Community", "Tropical", "Rainwater"],
    description: "Open-plan bamboo structure with steep thatched roof and rainwater cascade system.",
  },
];

export default function ProjectsList() {
  const { data: projects, isLoading } = useListProjects();
  const [search, setSearch] = useState("");
  const [biomeFilter, setBiomeFilter] = useState("All Biomes");
  const [phaseFilter, setPhaseFilter] = useState("All Phases");
  const [wizardOpen, setWizardOpen] = useState(false);

  const filteredProjects = projects?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesBiome = biomeFilter === "All Biomes" || p.biome === biomeFilter;
    const matchesPhase = phaseFilter === "All Phases" || p.phase === phaseFilter;
    return matchesSearch && matchesBiome && matchesPhase;
  });

  return (
    <div className="space-y-10 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Habitat Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and evolve your regenerative designs.</p>
        </div>
        <Button
          onClick={() => setWizardOpen(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
        >
          <Sparkles className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Templates Gallery */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-2xl font-bold">Start from a Template</h2>
          <Badge className="bg-accent/15 text-accent border-accent/25">6 archetypes</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Pre-configured habitat archetypes loved by architects and self-builders alike. One click to customise.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => setWizardOpen(true)}
              className="group text-left p-4 rounded-2xl border-2 border-border/40 hover:border-primary/40 bg-card/50 hover:bg-card/80 transition-all space-y-2"
            >
              <p className="text-3xl">{t.emoji}</p>
              <p className="text-xs font-bold leading-tight">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.biome}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{t.size}</Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{t.budget}</Badge>
              </div>
              <Badge
                variant="secondary"
                className={`text-[9px] px-1.5 py-0 ${t.carbon.includes("negative") ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-amber-100 text-amber-700"}`}
              >
                {t.carbon}
              </Badge>
              <p className="text-[10px] text-muted-foreground leading-snug hidden md:block">{t.description}</p>
              <div className="flex items-center gap-1 text-[10px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Use template <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border/50" />
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Projects</p>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Filters */}
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
          <Button variant="outline" onClick={() => setWizardOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Start New Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
