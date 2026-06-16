import { useListProjects, useGetFeaturedMaterials, useGetProjectStats } from "@workspace/api-client-react";
import { ProjectCard, ProjectSkeleton } from "@/components/projects/ProjectCard";
import { MaterialCard, MaterialSkeleton } from "@/components/materials/MaterialCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Leaf, Sun, Droplets, TreePine, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { cn } from "@/lib/utils";

export default function Dashboard() {
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
            <NewProjectDialog trigger={
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 shadow-xl hover:shadow-accent/20 transition-all font-bold">
                <Plus className="mr-2 h-5 w-5" />
                New Project
              </Button>
            } />
            <Link href="/materials">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/30 hover:bg-white/10 text-white">
                Explore Materials
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
              <NewProjectDialog trigger={
                <Button>Start Your First Habitat</Button>
              } />
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

      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-50">
        <NewProjectDialog trigger={
          <Button size="icon" className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-2xl hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </Button>
        } />
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  );
}
