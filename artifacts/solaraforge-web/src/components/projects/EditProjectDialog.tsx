import { useState } from "react";
import { useUpdateProject, getGetProjectQueryKey, getListProjectsQueryKey, Project } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";

const BIOMES = [
  "Desert", "Temperate Forest", "Tropical", "Mediterranean",
  "Mountain", "Arctic", "Urban", "Coastal", "Prairie / Grassland",
];

const PHASES = ["concept", "planning", "design", "build", "complete"];

interface Props {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProjectDialog({ project, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProject = useUpdateProject();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [biome, setBiome] = useState(project.biome ?? "");
  const [phase, setPhase] = useState(project.phase ?? "concept");
  const [estimatedCost, setEstimatedCost] = useState(String(project.estimatedCost ?? ""));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Project name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          biome: biome || undefined,
          phase,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(project.id) });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project updated", description: name.trim() });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-sm font-semibold">Project Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Earthship Retreat"
              className="bg-background/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your habitat vision, key features, and goals…"
              className="bg-background/60 min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Biome</Label>
              <Select value={biome} onValueChange={setBiome}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue placeholder="Select biome" />
                </SelectTrigger>
                <SelectContent>
                  {BIOMES.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-cost" className="text-sm font-semibold">Estimated Cost (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="edit-cost"
                type="number"
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                placeholder="85000"
                className="pl-7 bg-background/60"
                min={0}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
