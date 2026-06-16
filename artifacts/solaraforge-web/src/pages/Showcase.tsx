import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Globe, Leaf, Sun, Droplets, ArrowRight, Star, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

// Featured community builds (curated static + live projects)
const FEATURED = [
  {
    name: "The Sonoran Earthship",
    location: "Arizona, USA",
    builder: "Rosa & Mateo Villanueva",
    biome: "Desert",
    size: "112 m²",
    year: 2024,
    solarScore: 96,
    embodiedCarbon: -3800,
    waterHarvesting: 62000,
    cost: 89000,
    tags: ["Off-grid", "Rammed tyre", "Greenhouse corridor", "100% rainwater"],
    description: "A south-facing earthship with a 12m food greenhouse corridor, rammed-earth tyre walls, and a 60kL rainwater cascade. First winter was completely off-grid — solar and a wood gasifier.",
    emoji: "🏔",
    highlight: "Carbon negative by 3.8 tonnes/year",
  },
  {
    name: "Mossy Creek CLT Cabin",
    location: "Scottish Highlands, UK",
    builder: "Anya Mackenzie",
    biome: "Temperate Forest",
    size: "48 m²",
    year: 2024,
    solarScore: 71,
    embodiedCarbon: 1200,
    waterHarvesting: 22000,
    cost: 52000,
    tags: ["Owner-built", "CLT", "Sedum roof", "Rocket stove"],
    description: "A solo owner-build over 18 months. Cross-laminated timber panels prefabbed off-site, assembled in 3 days. The sedum roof has attracted 14 species of bee. Energy use is 80% below UK average.",
    emoji: "🏡",
    highlight: "80% below average energy use",
  },
  {
    name: "Bambu Komunitas",
    location: "Bali, Indonesia",
    builder: "Suryadi Collective",
    biome: "Tropical",
    size: "180 m²",
    year: 2025,
    solarScore: 88,
    embodiedCarbon: -7200,
    waterHarvesting: 145000,
    cost: 34000,
    tags: ["Community build", "Bamboo structure", "Tropical", "Carbon negative"],
    description: "A communal longhouse built by 12 families over 6 weeks. All bamboo sourced within 5km, lashed using traditional Balinese joinery. The building sequesters carbon as the bamboo continues to grow on-site.",
    emoji: "🎋",
    highlight: "7.2 tonnes CO₂ sequestered",
  },
  {
    name: "The Cork Hill Cottage",
    location: "County Cork, Ireland",
    builder: "Siobhán & Eamon Forde",
    biome: "Temperate Forest",
    size: "85 m²",
    year: 2025,
    solarScore: 68,
    embodiedCarbon: -2900,
    waterHarvesting: 28000,
    cost: 78000,
    tags: ["Straw bale", "Lime render", "Passive solar", "HRV"],
    description: "Two-bedroom straw-bale cottage with south-facing clerestory windows and a Mechanical Heat Recovery Ventilation system. Airtightness test result: 0.6 ACH @ 50Pa — near Passivhaus standard.",
    emoji: "🌾",
    highlight: "0.6 ACH airtightness — near Passivhaus",
  },
  {
    name: "Arcosanti Annex",
    location: "New Mexico, USA",
    builder: "Desert Futures Collective",
    biome: "Desert",
    size: "95 m²",
    year: 2025,
    solarScore: 94,
    embodiedCarbon: -1800,
    waterHarvesting: 38000,
    cost: 61000,
    tags: ["Rammed earth", "Solar wall", "Water cistern", "Adobe"],
    description: "Inspired by Arcosanti, this rammed-earth compound uses a Trombe wall for winter solar gain and a courtyard for summer shade. Water cisterns were carved directly into the bedrock.",
    emoji: "🏺",
    highlight: "Solar wall covers 60% of winter heating",
  },
  {
    name: "Frisian Floating Home",
    location: "Friesland, Netherlands",
    builder: "Jan & Lotte van der Berg",
    biome: "Coastal",
    size: "62 m²",
    year: 2026,
    solarScore: 79,
    embodiedCarbon: 2100,
    waterHarvesting: 9000,
    cost: 115000,
    tags: ["Floating", "CLT hull", "Solar canopy", "Tidal"],
    description: "A floating home on a CLT pontoon hull, moored on a Dutch canal. The roof doubles as a full solar canopy powering the home and an EV charger. Designed to rise with any sea-level increase.",
    emoji: "🚢",
    highlight: "Flood-proof by design — rises with water level",
  },
];

const STATS = [
  { label: "Community Builds", value: "1,240+", icon: TreePine },
  { label: "Tonnes CO₂ Sequestered", value: "4,800", icon: Leaf },
  { label: "Avg Solar Score", value: "81%", icon: Sun },
  { label: "Countries Active", value: "47", icon: Globe },
];

export default function Showcase() {
  const { data: projects } = useListProjects();
  const liveProjects = (projects ?? []).filter(p => p.phase === "complete" || p.phase === "build");

  return (
    <div className="space-y-12 pb-20 md:pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/20" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-5 max-w-2xl">
          <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-1">
            <Globe className="w-3 h-3 mr-1" /> Community Showcase
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Habitats that heal.<br />
            <span className="text-accent italic">Built by our community.</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Real regenerative homes, built by real people — with SolaraForge as their design companion.
            Every build shared here is open-source: drawings, specs, costs, and lessons learned.
          </p>
          <Link href="/projects">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 mt-2 gap-2">
              Start Your Build <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/50 bg-card/50 text-center">
            <CardContent className="p-5 space-y-2">
              <Icon className="h-5 w-5 text-accent mx-auto" />
              <p className="font-serif text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Builds */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-2xl font-bold">Featured Builds</h2>
          <Badge variant="outline" className="text-accent border-accent/30">
            <Star className="h-3 w-3 mr-1" /> Curated
          </Badge>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map(build => (
            <Card key={build.name} className="border-border/50 bg-card/60 hover:shadow-lg transition-all overflow-hidden group">
              {/* Colour band based on biome */}
              <div className={cn(
                "h-1.5 w-full",
                build.biome === "Desert" ? "bg-amber-400" :
                build.biome === "Tropical" ? "bg-green-500" :
                build.biome === "Coastal" ? "bg-blue-400" : "bg-primary"
              )} />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-3xl">{build.emoji}</span>
                    <h3 className="font-serif font-bold text-base leading-snug mt-1">{build.name}</h3>
                    <p className="text-xs text-muted-foreground">{build.location} · {build.year}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{build.biome}</Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{build.description}</p>

                {/* Highlight */}
                <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 border border-green-200/50 rounded-lg px-2.5 py-1.5">
                  <Leaf className="h-3 w-3 shrink-0" /> {build.highlight}
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 text-center border-t border-border/30 pt-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Solar</p>
                    <p className="text-sm font-bold text-accent">{build.solarScore}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Carbon</p>
                    <p className={cn("text-sm font-bold", build.embodiedCarbon < 0 ? "text-green-700 dark:text-green-400" : "text-amber-600")}>
                      {build.embodiedCarbon < 0 ? "−" : "+"}{Math.abs(Math.round(build.embodiedCarbon / 1000 * 10) / 10)}t
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Cost</p>
                    <p className="text-sm font-bold">${(build.cost / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {build.tags.slice(0, 3).map(t => (
                    <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0 border-border/40">{t}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2">
                  <span>Built by <strong className="text-foreground/80">{build.builder}</strong></span>
                  <span>{build.size}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Live projects from the user's workspace */}
      {liveProjects.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold">Your Builds in Progress</h2>
            <Badge className="bg-green-600 text-white">{liveProjects.length} active</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveProjects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="border-border/50 bg-card/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold">{p.name}</h3>
                      <Badge className="capitalize" variant="outline">{p.phase}</Badge>
                    </div>
                    <div className="flex gap-3 text-center">
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Solar</p>
                        <p className="text-sm font-bold text-accent">{p.solarScore ?? 0}%</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Carbon</p>
                        <p className={cn("text-sm font-bold", (p.embodiedCarbon ?? 0) < 0 ? "text-green-600" : "text-amber-600")}>
                          {(p.embodiedCarbon ?? 0) < 0 ? "−" : "+"}{Math.abs(p.embodiedCarbon ?? 0)} kg
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Biome</p>
                        <p className="text-sm font-bold truncate">{p.biome ?? "—"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-primary font-semibold flex items-center gap-1">
                      View project <ArrowRight className="h-3 w-3" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="text-center py-8 border border-dashed border-border/40 rounded-3xl bg-muted/20 space-y-4">
        <p className="text-3xl">🌿</p>
        <h2 className="font-serif text-2xl font-bold">Your build could be here</h2>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">Every home built with SolaraForge is eligible for the community showcase. Open-source your build and inspire others.</p>
        <Link href="/projects">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
            Start Your Project <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
