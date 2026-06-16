import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useCreateProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const BIOMES = [
  "Desert", 
  "Temperate Forest", 
  "Tropical", 
  "Mediterranean", 
  "Arctic", 
  "Urban", 
  "Coastal"
];

const PHASES = [
  "concept",
  "planning",
  "design",
  "build",
  "complete"
];

interface NewProjectDialogProps {
  trigger: React.ReactNode;
}

export function NewProjectDialog({ trigger }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createProject = useCreateProject();

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      biome: "Temperate Forest",
      phase: "concept",
      estimatedCost: 0
    }
  });

  const onSubmit = (data: any) => {
    createProject.mutate({
      data: {
        ...data,
        estimatedCost: Number(data.estimatedCost)
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({
          title: "Project created",
          description: "Your new habitat project is ready for design.",
        });
        setOpen(false);
        reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-card border-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold">New Habitat Project</DialogTitle>
          <DialogDescription>
            Define the foundation of your regenerative habitat.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input 
                {...register("name", { required: true })} 
                placeholder="E.g. Mossy Creek Sanctuary"
                className="bg-muted/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                {...register("description")} 
                placeholder="What is the vision for this habitat?"
                className="bg-muted/30 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Biome</label>
                <Select 
                  defaultValue={watch("biome")} 
                  onValueChange={(val) => setValue("biome", val)}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select biome" />
                  </SelectTrigger>
                  <SelectContent>
                    {BIOMES.map(biome => (
                      <SelectItem key={biome} value={biome}>{biome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase</label>
                <Select 
                  defaultValue={watch("phase")} 
                  onValueChange={(val) => setValue("phase", val)}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map(phase => (
                      <SelectItem key={phase} value={phase} className="capitalize">{phase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Budget ($)</label>
              <Input 
                type="number" 
                {...register("estimatedCost")} 
                className="bg-muted/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProject.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
