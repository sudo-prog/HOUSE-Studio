import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ARCHETYPES = [
  { id: "earthship", emoji: "🏔", label: "Earthship", tagline: "Tire-and-earth fortress, fully off-grid", biome: "Desert", solarScore: 92, embodiedCarbon: -2400, estimatedCost: 95000, phase: "concept", waterHarvesting: 45000, description: "An earthship built into the hillside using rammed-earth tyres, grey-water recycling, a food greenhouse corridor, and 100% solar + wind power. Completely off-grid and self-sustaining." },
  { id: "tiny-cabin", emoji: "🏡", label: "Tiny Forest Cabin", tagline: "Compact CLT cabin in the trees", biome: "Temperate Forest", solarScore: 74, embodiedCarbon: 1200, estimatedCost: 45000, phase: "concept", waterHarvesting: 8000, description: "A 25m² CLT micro-cabin with a loft bedroom, composting toilet, rocket mass heater, and a small PV array. Low footprint, high quality of life." },
  { id: "container", emoji: "🚢", label: "Container Home", tagline: "Industrial-chic upcycled shipping containers", biome: "Coastal", solarScore: 80, embodiedCarbon: 3800, estimatedCost: 65000, phase: "concept", waterHarvesting: 12000, description: "Two upcycled 40ft shipping containers arranged in an L-shape with a living roof, hempcrete-infilled walls for insulation, passive ventilation and rooftop solar." },
  { id: "straw-bale", emoji: "🌾", label: "Straw Bale Cottage", tagline: "Cosy, carbon-negative natural home", biome: "Temperate Forest", solarScore: 78, embodiedCarbon: -3200, estimatedCost: 72000, phase: "concept", waterHarvesting: 18000, description: "A two-bedroom straw bale cottage with lime render, reclaimed timber frame, triple-glazed south-facing windows, and a sedum living roof over the utility wing." },
  { id: "cob", emoji: "🏺", label: "Cob Cottage", tagline: "Sculpted earth home, ancient wisdom", biome: "Mediterranean", solarScore: 71, embodiedCarbon: -800, estimatedCost: 38000, phase: "concept", waterHarvesting: 6000, description: "A hand-sculpted cob cottage with round walls, bottle-glass windows, a rocket stove, and a sunken courtyard garden for passive cooling. Owner-builder friendly." },
  { id: "bamboo", emoji: "🎋", label: "Bamboo Longhouse", tagline: "Tropical open-plan community living", biome: "Tropical", solarScore: 85, embodiedCarbon: -4800, estimatedCost: 28000, phase: "concept", waterHarvesting: 55000, description: "A 60m² open-plan bamboo structure with a steep thatched roof for heavy tropical rain, raised floors for airflow, rainwater cascade system, and solar micro-grid." },
  { id: "custom", emoji: "✏️", label: "Start from Scratch", tagline: "Design your own from a blank canvas", biome: "Temperate Forest", solarScore: 70, embodiedCarbon: 0, estimatedCost: 60000, phase: "concept", waterHarvesting: 10000, description: "" },
];

const BIOMES = ["Desert", "Temperate Forest", "Tropical", "Mediterranean", "Mountain", "Coastal", "Arctic", "Prairie / Grassland"];

const PRIORITIES = [
  { id: "carbon-negative", label: "Carbon Negative", emoji: "🌱" },
  { id: "water-independence", label: "Water Independence", emoji: "💧" },
  { id: "low-cost", label: "Low Cost / DIY", emoji: "🔨" },
  { id: "off-grid", label: "Fully Off-Grid", emoji: "⚡" },
  { id: "food-production", label: "Food Production", emoji: "🥕" },
  { id: "community", label: "Community Living", emoji: "👥" },
  { id: "passive-solar", label: "Passive Solar", emoji: "☀" },
  { id: "natural-materials", label: "All-Natural Materials", emoji: "🪵" },
];

const STEPS = ["Style", "Location", "Size", "Priorities", "Name it", "Done"];

export default function ProjectWizard({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const createProject = useCreateProject();

  const [step, setStep] = useState(0);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [biome, setBiome] = useState("Temperate Forest");
  const [floorArea, setFloorArea] = useState(80);
  const [budget, setBudget] = useState(65000);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedArchetype = ARCHETYPES.find(a => a.id === archetype);

  const togglePriority = (id: string) => {
    setPriorities(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const canAdvance = () => {
    if (step === 0) return archetype !== null;
    if (step === 1) return biome !== "";
    if (step === 4) return projectName.trim().length > 0;
    return true;
  };

  const advance = () => { if (canAdvance() && step < 5) setStep(s => s + 1); };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  const handleCreate = async () => {
    if (!selectedArchetype || !projectName.trim()) return;
    setIsCreating(true);
    try {
      const priorityTags = priorities.map(p => PRIORITIES.find(pr => pr.id === p)?.label ?? p).join(", ");
      const descBase = archetype === "custom" ? customDesc : selectedArchetype.description;
      const fullDesc = [descBase, priorityTags ? `Priorities: ${priorityTags}.` : ""].filter(Boolean).join(" ");
      const scaleFactor = floorArea / 80;

      const metricsNote = [
        `Floor area: ${floorArea}m².`,
        `Solar score: ${selectedArchetype.solarScore}%.`,
        `Estimated embodied carbon: ${Math.round(selectedArchetype.embodiedCarbon * scaleFactor)} kg CO₂e.`,
        `Water harvesting capacity: ${Math.round(selectedArchetype.waterHarvesting * Math.sqrt(scaleFactor))} L/yr.`,
      ].join(" ");

      const result = await createProject.mutateAsync({
        data: {
          name: projectName.trim(),
          description: [fullDesc, metricsNote].filter(Boolean).join(" "),
          biome,
          phase: selectedArchetype.phase as "concept",
          estimatedCost: Math.round(budget),
        },
      });
      toast({ title: "Project created! 🌿", description: `${projectName} is ready to build out.` });
      onOpenChange(false);
      setStep(0); setArchetype(null); setPriorities([]); setProjectName(""); setCustomDesc("");
      navigate(`/projects/${result.id}`);
    } catch {
      toast({ title: "Failed to create project", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const progressPct = (step / (STEPS.length - 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <div
            className="h-1.5 bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-xl">
              {step === 0 && "What's your dream home style?"}
              {step === 1 && "Where are you building?"}
              {step === 2 && "How big and what budget?"}
              {step === 3 && "What matters most to you?"}
              {step === 4 && "Give it a name"}
              {step === 5 && "Ready to build!"}
            </DialogTitle>
            <div className="flex gap-1">
              {STEPS.slice(0, -1).map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full transition-colors", i <= step ? "bg-accent" : "bg-muted")} />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 0 && "Choose a starting template — you can customise everything after."}
            {step === 1 && "Your climate shapes materials, insulation, and solar strategy."}
            {step === 2 && "Rough numbers are fine — you can refine in the project later."}
            {step === 3 && "Pick up to 4 priorities that will shape AI recommendations."}
            {step === 4 && "A good name inspires. What will you call this place?"}
            {step === 5 && "Your project is configured and ready to develop."}
          </p>
        </DialogHeader>

        <div className="px-6 py-5 min-h-[320px]">
          {/* Step 0: Archetype */}
          {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ARCHETYPES.map(a => (
                <button
                  key={a.id}
                  onClick={() => { setArchetype(a.id); if (a.id !== "custom") setBiome(a.biome); }}
                  className={cn(
                    "text-left p-3 rounded-xl border-2 transition-all space-y-1 group",
                    archetype === a.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                      : "border-border/40 hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <p className="text-xs font-bold leading-tight">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{a.tagline}</p>
                  {archetype === a.id && a.id !== "custom" && (
                    <div className="flex gap-1 flex-wrap pt-1">
                      <Badge variant="outline" className="text-[9px] px-1">${(a.estimatedCost / 1000).toFixed(0)}k est.</Badge>
                      <Badge variant="outline" className={cn("text-[9px] px-1", a.embodiedCarbon < 0 ? "text-green-700" : "")}>
                        {a.embodiedCarbon < 0 ? "−" : "+"}{Math.abs(a.embodiedCarbon / 1000).toFixed(1)}t CO₂
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Biome */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {BIOMES.map(b => (
                <button
                  key={b}
                  onClick={() => setBiome(b)}
                  className={cn(
                    "text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                    biome === b
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/40 hover:border-primary/30 text-muted-foreground"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Size + budget */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Floor Area</Label>
                  <Badge variant="outline" className="text-sm px-3 py-1">{floorArea} m² ({Math.round(floorArea * 10.764)} sq ft)</Badge>
                </div>
                <Slider min={15} max={500} step={5} value={[floorArea]} onValueChange={v => setFloorArea(v[0])} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tiny (15m²)</span><span>Studio (30m²)</span><span>Cabin (80m²)</span><span>Family (150m²)</span><span>Homestead (500m²)</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Budget</Label>
                  <Badge variant="outline" className="text-sm px-3 py-1">${budget.toLocaleString()}</Badge>
                </div>
                <Slider min={10000} max={500000} step={5000} value={[budget]} onValueChange={v => setBudget(v[0])} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$10k (DIY shell)</span><span>$60k (owner-builder)</span><span>$200k (comfortable)</span><span>$500k (luxury)</span>
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Budget / m²</p>
                  <p className="text-lg font-serif font-bold">${Math.round(budget / floorArea).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Style</p>
                  <p className="text-sm font-bold">{selectedArchetype?.label}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Climate</p>
                  <p className="text-sm font-bold">{biome}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Priorities */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {PRIORITIES.map(p => {
                  const selected = priorities.includes(p.id);
                  const atMax = priorities.length >= 4 && !selected;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePriority(p.id)}
                      disabled={atMax}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                        selected ? "border-accent bg-accent/5" : "border-border/40 hover:border-accent/30",
                        atMax && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-sm font-medium">{p.label}</span>
                      {selected && <CheckCircle2 className="h-4 w-4 text-accent ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">{priorities.length} / 4 selected — these guide AI recommendations</p>
            </div>
          )}

          {/* Step 4: Name */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Project Name</Label>
                <Input
                  autoFocus
                  placeholder={`e.g. "${selectedArchetype?.label === "custom" ? "Our Dream Home" : `The ${biome.split(" ")[0]} ${selectedArchetype?.label}`}"`}
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && canAdvance() && advance()}
                  className="text-lg h-12 bg-background/50"
                />
              </div>
              {archetype === "custom" && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Describe your vision <span className="text-muted-foreground font-normal text-sm">(optional)</span></Label>
                  <textarea
                    placeholder="Tell us about your dream home — the feeling, the materials, the lifestyle..."
                    value={customDesc}
                    onChange={e => setCustomDesc(e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-border/50 rounded-xl px-3 py-2 bg-background/50 resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>
              )}
              <div className="p-4 bg-muted/20 rounded-xl space-y-2 border border-border/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your project summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Style: </span><span className="font-medium">{selectedArchetype?.label}</span></div>
                  <div><span className="text-muted-foreground">Climate: </span><span className="font-medium">{biome}</span></div>
                  <div><span className="text-muted-foreground">Size: </span><span className="font-medium">{floorArea} m²</span></div>
                  <div><span className="text-muted-foreground">Budget: </span><span className="font-medium">${budget.toLocaleString()}</span></div>
                  {priorities.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Priorities: </span>
                      <span className="font-medium">{priorities.map(id => PRIORITIES.find(p => p.id === id)?.label).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center h-60 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold">"{projectName}"</h3>
                <p className="text-muted-foreground mt-1">
                  {selectedArchetype?.label} · {floorArea}m² · {biome} · ${budget.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your project is pre-configured with materials, solar score, and carbon estimates.
                The AI Collaborator is ready to help you design every detail.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t border-border/40 flex justify-between items-center bg-muted/20">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {step < 5 ? (
            <Button
              onClick={advance}
              disabled={!canAdvance()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1 px-6"
            >
              {step === 4 ? "Review" : "Next"} <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isCreating ? "Creating…" : "Create Project"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
