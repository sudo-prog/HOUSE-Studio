import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Leaf, Sun, Droplets, TreePine, Zap, Heart, Globe, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const principles = [
  {
    icon: Leaf,
    title: "Carbon Negative by Design",
    body: "Every habitat we help design sequesters more carbon than it emits. We count embodied carbon from ground-up — from the clay in the rammed earth to the fungi in the mycelium panels.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Sun,
    title: "Solar-First, Grid-Independent",
    body: "Passive solar design is the oldest technology on Earth. We start with orientation and thermal mass before we ever spec a panel — then we layer renewables on top of an already-efficient envelope.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Droplets,
    title: "Radical Water Sovereignty",
    body: "Rainwater harvesting, constructed wetlands, and grey-water recycling are not niche — they're the baseline. Every SolaraForge project models water capture capacity from day one.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: TreePine,
    title: "Biophilic & Vernacular",
    body: "We don't import solutions. We look to the land — its soils, its plants, its seasonal patterns — and design habitats that fit their biome like organisms that evolved there.",
    color: "text-primary",
    bg: "bg-primary/5",
  },
  {
    icon: Zap,
    title: "AI as Collaborator",
    body: "Our AI doesn't replace designers — it accelerates them. It carries the materials science, the carbon math, and the biome knowledge, so human creativity can focus on the soul of the space.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Heart,
    title: "Community, Not Commodity",
    body: "Regenerative housing must be accessible. We publish all our material data openly, keep our carbon scoring auditable, and commit to open-source tooling for any community that needs it.",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
];

const milestones = [
  { year: "2024", event: "SolaraForge concept born from a failed planning permission — a hempcrete house that the council rejected because it had no precedent." },
  { year: "2025", event: "Materials library reaches 200+ entries. First community build completed using SolaraSpec cards as the primary design document." },
  { year: "2026", event: "AI Collaborator launched. Open beta opens to 1,000 regenerative designers, architects, and self-builders worldwide." },
];

export default function About() {
  return (
    <div className="space-y-16 pb-20 md:pb-8 max-w-3xl mx-auto">
      {/* Manifesto Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 text-primary-foreground shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/20" />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-5">
          <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-1">
            <Globe className="w-3 h-3 mr-1" /> Our Manifesto
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Housing that heals<br />the planet it stands on.
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl leading-relaxed">
            SolaraForge exists because the construction industry is the world's largest carbon emitter — and because every single building is also an opportunity to reverse that. We believe your home can sequester carbon, harvest water, regenerate soil, and feed you.
          </p>
          <p className="text-primary-foreground/70 text-base max-w-xl">
            This is solarpunk made practical. Not a fantasy — a methodology.
          </p>
        </div>
      </section>

      {/* Six Principles */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">Six Principles of Regenerative Design</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {principles.map(({ icon: Icon, title, body, color, bg }) => (
            <Card key={title} className="border-border/40 bg-card/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className={`inline-flex p-2.5 rounded-xl ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-serif font-bold text-base text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Timeline */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">Our Story</h2>
        <div className="space-y-6 relative before:absolute before:left-[52px] before:top-2 before:bottom-2 before:w-px before:bg-border">
          {milestones.map(({ year, event }) => (
            <div key={year} className="flex gap-6 items-start">
              <div className="shrink-0 w-[52px] text-right">
                <Badge variant="outline" className="font-mono text-accent border-accent/40">{year}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pt-1">{event}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Open Data Commitment */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">Open Data Commitment</h2>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-6 space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              All embodied carbon figures in SolaraForge's Materials Library are sourced from peer-reviewed EPDs (Environmental Product Declarations) and the ICE Database. Every number is auditable. We don't hide uncertainty — we show ranges.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our AI's material recommendations are grounded in this same open dataset. We will never recommend a material because of a commercial relationship.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Ready to design your habitat?</h2>
        <p className="text-muted-foreground">Start with a project, explore the materials library, or let the AI analyse your inspiration board.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/projects">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8" data-testid="link-start-project">
              <TreePine className="mr-2 h-5 w-5" /> Start a Project
            </Button>
          </Link>
          <Link href="/studio">
            <Button size="lg" variant="outline" className="rounded-full px-8 border-accent text-accent hover:bg-accent/10" data-testid="link-try-studio">
              <Zap className="mr-2 h-5 w-5" /> Try the Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
