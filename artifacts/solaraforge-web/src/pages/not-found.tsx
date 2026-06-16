import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Home, TreePine, Wrench, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg mx-auto space-y-8">
        {/* Decorative */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="relative flex items-center justify-center w-32 h-32">
            <Leaf className="w-16 h-16 text-primary/40" />
            <span className="absolute font-serif font-bold text-4xl text-primary/60 -top-1 -right-3 rotate-12">?</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">404</p>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Off the map, friend.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            This page doesn't exist in the SolaraForge ecosystem — yet.
            The habitats we're building are regenerative, but even they have boundaries.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Link href="/">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-center w-full">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Dashboard</span>
            </button>
          </Link>
          <Link href="/projects">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-center w-full">
              <TreePine className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Projects</span>
            </button>
          </Link>
          <Link href="/tools">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-center w-full">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Toolkit</span>
            </button>
          </Link>
        </div>

        <Link href="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to SolaraForge
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground/50">
          "The best time to plant a tree was 20 years ago. The second best time is now."
        </p>
      </div>
    </div>
  );
}
