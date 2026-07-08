import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TreePine, Package, Wand2, BarChart3, ArrowRight } from "lucide-react";

const STORAGE_KEY = "sf-welcomed";

const STEPS = [
  {
    icon: TreePine,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    title: "Design habitats",
    body: "Create projects, track phases, and build your regenerative design portfolio.",
  },
  {
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    title: "Explore materials",
    body: "Browse 40+ carbon-rated materials — filter by biome, compare, and save favourites.",
  },
  {
    icon: Wand2,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    title: "AI Moodboard Studio",
    body: "Upload inspiration images or describe your vision — get a full SolaraSpec in seconds.",
  },
  {
    icon: BarChart3,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    title: "10 design calculators",
    body: "Model solar yield, rainwater capacity, embodied carbon, straw-bale walls and more.",
  },
];

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Welcome to SolaraForge</DialogTitle>
        <DialogDescription className="sr-only">
          Your solarpunk habitat toolkit — design, calculate, and build carbon-negative homes.
        </DialogDescription>
        {/* Hero */}
        <div className="bg-primary px-8 py-8 text-primary-foreground space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xl">🌿</span>
            </div>
            <span className="font-serif text-2xl font-bold">SolaraForge</span>
          </div>
          <h2 className="font-serif text-3xl font-bold leading-tight">
            Welcome to regenerative design.
          </h2>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            Your solarpunk habitat toolkit — design, calculate, and build carbon-negative homes.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3 p-6">
          {STEPS.map(({ icon: Icon, color, bg, title, body }) => (
            <div key={title} className={`rounded-xl p-4 space-y-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Link href="/projects" className="flex-1">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full"
              onClick={dismiss}
            >
              <TreePine className="h-4 w-4" /> Start a project
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-full"
            onClick={dismiss}
          >
            Explore first <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-center pb-4">
          No account needed · All data stored locally · Open source ethos
        </p>
      </DialogContent>
    </Dialog>
  );
}
