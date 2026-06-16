import { useListProjects, useGetFeaturedMaterials, useGetProjectStats } from "@workspace/api-client-react";
import { ProjectCard, ProjectSkeleton } from "@/components/projects/ProjectCard";
import { MaterialCard, MaterialSkeleton } from "@/components/materials/MaterialCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Sun, Droplets, TreePine, ArrowRight, Wrench, Wand2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";
import ProjectWizard from "@/components/wizard/ProjectWizard";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: featuredMaterials, isLoading: materialsLoading } = useGetFeaturedMaterials();
  const { data: stats, isLoading: statsLoading } = useGetProjectStats();

  const totalCarbon = stats?.totalCarbonSaved ?? 0;
  const avgSolarScore = stats?.avgSolarScore ?? 0;
  const totalWater = projects?.reduce((acc, p) => acc + (p.waterHarvesting ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-sm px-4 py-1 mb-2">
            AI-Powered Regeneration
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight">
            Design Your <span className="text-accent italic">Regenerative</span> Habitat
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-lg">
            Harness nature's intelligence with SolaraForge AI to build habitats that heal the Earth.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => setWizardOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 shadow-xl hover:shadow-accent/20 transition-all font-bold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start New Project
            </Button>
            <Link href="/tools">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/30 hover:bg-white/10 text-white">
                <Wrench className="mr-2 h-4 w-4" /> Design Toolkit
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Organic Background Shapes */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl opacity-30" />
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: stats?.totalProjects ?? 0, icon: TreePine, color: "text-primary" },
          { label: "Avg Solar Score", value: `${Number(avgSolarScore).toFixed(1)}%`, icon: Sun, color: "text-accent" },
          { label: "Carbon Sequestered", value: `${totalCarbon.toFixed(1)} kg`, icon: Leaf, color: "text-green-600" },
          { label: "Water Capacity", value: `${totalWater.toLocaleString()} L`, icon: Droplets, color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={cn("p-2 rounded-lg bg-muted/50", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
                <p className="text-xl font-bold font-serif">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Materials Scroll Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Featured Materials</h2>
          <Link href="/materials" className="text-primary text-sm font-semibold flex items-center hover:underline">
            Library <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-4">
            {materialsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-64">
                  <MaterialSkeleton />
                </div>
              ))
            ) : (
              featuredMaterials?.map(material => (
                <div key={material.id} className="w-64 whitespace-normal">
                  <MaterialCard material={material} />
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Projects Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Your Habitat Projects</h2>
          <Link href="/projects" className="text-primary text-sm font-semibold flex items-center hover:underline">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        {projectsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="p-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <TreePine className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No projects yet</h3>
                <p className="text-muted-foreground">Begin your regeneration journey today.</p>
              </div>
              <Button onClick={() => setWizardOpen(true)}>Start Your First Habitat</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Your Impact Section */}
      {(stats?.totalProjects ?? 0) > 0 && (
        <section className="rounded-2xl border border-green-200/60 bg-gradient-to-br from-green-50/80 via-background to-primary/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-600/10">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Your Environmental Impact</h2>
              <p className="text-xs text-muted-foreground">Aggregated across all your regenerative projects</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                emoji: "🌳",
                label: "Trees Equivalent",
                value: Math.round(Math.abs(totalCarbon) / 21).toLocaleString(),
                desc: "Annual CO₂ absorbed by trees",
                color: "text-green-700",
              },
              {
                emoji: "🚗",
                label: "Car Journeys Offset",
                value: Math.round(Math.abs(totalCarbon) / 120).toLocaleString(),
                desc: "Average car journeys eliminated",
                color: "text-primary",
              },
              {
                emoji: "💧",
                label: "Water Harvested",
                value: `${(totalWater / 1000).toFixed(1)}kL`,
                desc: "Annual renewable water capacity",
                color: "text-blue-600",
              },
              {
                emoji: "☀",
                label: "Solar Efficiency",
                value: `${Number(avgSolarScore).toFixed(0)}%`,
                desc: `Average across ${stats?.totalProjects ?? 0} project${(stats?.totalProjects ?? 0) !== 1 ? "s" : ""}`,
                color: "text-amber-600",
              },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-white/60 border border-border/30 space-y-1">
                <p className="text-2xl">{item.emoji}</p>
                <p className={cn("text-xl font-bold font-serif", item.color)}>{item.value}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          {totalCarbon >= 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/50 rounded-lg px-3 py-2">
              💡 Your projects currently emit {totalCarbon.toFixed(0)} kg CO₂e. Switch wall systems to hempcrete or straw bale to go carbon-negative.
            </p>
          )}
          {totalCarbon < 0 && (
            <p className="text-xs text-green-700 bg-green-50/80 border border-green-200/50 rounded-lg px-3 py-2">
              🌿 Your projects are <strong>carbon negative</strong> — they sequester more CO₂ than they emit. You're building a regenerative future.
            </p>
          )}
        </section>
      )}

      {/* Quick-access toolkit strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">Design Toolkit</h2>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="text-primary text-xs">
              All Tools <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Solar Designer", emoji: "☀", desc: "Panel count & yield", href: "/tools" },
            { label: "Materials Estimator", emoji: "🧱", desc: "Cost & carbon", href: "/tools" },
            { label: "Rainwater Harvester", emoji: "💧", desc: "Tank sizing", href: "/tools" },
            { label: "Insulation Wizard", emoji: "🌡", desc: "R-value by climate", href: "/tools" },
            { label: "Budget Planner", emoji: "💰", desc: "Line-item tracker", href: "/tools" },
          ].map(tool => (
            <Link key={tool.label} href={tool.href}>
              <Card className="border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer h-full">
                <CardContent className="p-4 text-center space-y-1">
                  <p className="text-2xl">{tool.emoji}</p>
                  <p className="text-xs font-bold leading-tight">{tool.label}</p>
                  <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-50">
        <Button
          size="icon"
          onClick={() => setWizardOpen(true)}
          className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-2xl hover:scale-110 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
