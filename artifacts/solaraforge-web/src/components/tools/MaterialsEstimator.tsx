import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, Leaf, DollarSign, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialSystem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  costPerSqm: number;
  carbonPerSqm: number;
  wallThicknessMm: number;
  rValue: number;
  color: string;
}

const WALL_SYSTEMS: MaterialSystem[] = [
  { id: "hempcrete", name: "Hempcrete", emoji: "🌿", description: "Hemp + lime biocomposite", costPerSqm: 95, carbonPerSqm: -18, wallThicknessMm: 350, rValue: 2.8, color: "bg-green-100 border-green-300" },
  { id: "rammed-earth", name: "Rammed Earth", emoji: "🏔", description: "Compacted local subsoil", costPerSqm: 75, carbonPerSqm: 5, wallThicknessMm: 400, rValue: 1.8, color: "bg-amber-100 border-amber-300" },
  { id: "clt", name: "Cross-Laminated Timber", emoji: "🌲", description: "Mass timber panels", costPerSqm: 140, carbonPerSqm: 28, wallThicknessMm: 200, rValue: 3.2, color: "bg-lime-100 border-lime-300" },
  { id: "straw-bale", name: "Straw Bale", emoji: "🌾", description: "Agricultural straw bales", costPerSqm: 55, carbonPerSqm: -15, wallThicknessMm: 450, rValue: 6.5, color: "bg-yellow-100 border-yellow-300" },
  { id: "cob", name: "Cob", emoji: "🏺", description: "Earth, sand & straw mix", costPerSqm: 40, carbonPerSqm: 2, wallThicknessMm: 500, rValue: 1.5, color: "bg-orange-100 border-orange-300" },
  { id: "timber-frame", name: "Timber Frame + Insulation", emoji: "🪵", description: "Post & beam with wool insulation", costPerSqm: 120, carbonPerSqm: 35, wallThicknessMm: 300, rValue: 5.0, color: "bg-teal-100 border-teal-300" },
];

const ROOF_SYSTEMS = [
  { id: "living", name: "Living Roof (Sedum)", costPerSqm: 180, carbonPerSqm: 10 },
  { id: "metal", name: "Recycled Metal Roofing", costPerSqm: 55, carbonPerSqm: 20 },
  { id: "timber-shingles", name: "Timber Shingles (FSC)", costPerSqm: 90, carbonPerSqm: 18 },
  { id: "clt-roof", name: "CLT Flat / Low-slope", costPerSqm: 150, carbonPerSqm: 22 },
];

const FLOOR_SYSTEMS = [
  { id: "polished-concrete", name: "Recycled Aggregate Concrete", costPerSqm: 60, carbonPerSqm: 80 },
  { id: "timber-floor", name: "Reclaimed Timber Boards", costPerSqm: 95, carbonPerSqm: 5 },
  { id: "earth-floor", name: "Linseed-Oiled Earth Floor", costPerSqm: 30, carbonPerSqm: 2 },
  { id: "bamboo-floor", name: "Bamboo Flooring", costPerSqm: 70, carbonPerSqm: -10 },
];

export default function MaterialsEstimator() {
  const [floorArea, setFloorArea] = useState(80);
  const [stories, setStories] = useState(1);
  const [wallSystem, setWallSystem] = useState("hempcrete");
  const [roofSystem, setRoofSystem] = useState("living");
  const [floorSystem, setFloorSystem] = useState("timber-floor");
  const [windows, setWindows] = useState(20);

  const wall = WALL_SYSTEMS.find(w => w.id === wallSystem)!;
  const roof = ROOF_SYSTEMS.find(r => r.id === roofSystem)!;
  const floor = FLOOR_SYSTEMS.find(f => f.id === floorSystem)!;

  const result = useMemo(() => {
    const perimeter = Math.sqrt(floorArea) * 4;
    const wallHeight = 2.7 * stories;
    const grossWallArea = perimeter * wallHeight;
    const windowArea = (grossWallArea * windows) / 100;
    const netWallArea = grossWallArea - windowArea;
    const roofArea = floorArea * 1.15; // overhang factor

    const wallCost = netWallArea * wall.costPerSqm;
    const roofCost = roofArea * roof.costPerSqm;
    const floorCost = floorArea * floor.costPerSqm;
    const windowCost = windowArea * 350; // triple-glazed
    const foundationCost = floorArea * 85;

    const wallCarbon = netWallArea * wall.carbonPerSqm;
    const roofCarbon = roofArea * roof.carbonPerSqm;
    const floorCarbon = floorArea * floor.carbonPerSqm;

    const totalCost = wallCost + roofCost + floorCost + windowCost + foundationCost;
    const totalCarbon = wallCarbon + roofCarbon + floorCarbon;
    const fitoutCost = totalCost * 0.35; // M&E, finishes, etc.
    const grandTotal = totalCost + fitoutCost;

    return {
      netWallArea: Math.round(netWallArea),
      roofArea: Math.round(roofArea),
      windowArea: Math.round(windowArea),
      wallCost: Math.round(wallCost),
      roofCost: Math.round(roofCost),
      floorCost: Math.round(floorCost),
      windowCost: Math.round(windowCost),
      foundationCost: Math.round(foundationCost),
      fitoutCost: Math.round(fitoutCost),
      grandTotal: Math.round(grandTotal),
      totalCarbon: Math.round(totalCarbon),
      costPerSqm: Math.round(grandTotal / floorArea),
    };
  }, [floorArea, stories, wall, roof, floor, windows]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-5 gap-6">
        {/* Inputs column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" /> Building Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Floor Area</Label>
                  <Badge variant="outline">{floorArea} m²</Badge>
                </div>
                <Slider min={20} max={500} step={5} value={[floorArea]} onValueChange={v => setFloorArea(v[0])} />
                <p className="text-[11px] text-muted-foreground">Tiny home=20–45m² · Family=80–150m² · Homestead=150–500m²</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Number of Stories</Label>
                  <Badge variant="outline">{stories}</Badge>
                </div>
                <Slider min={1} max={3} step={1} value={[stories]} onValueChange={v => setStories(v[0])} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Window / Opening %</Label>
                  <Badge variant="outline">{windows}%</Badge>
                </div>
                <Slider min={5} max={50} step={1} value={[windows]} onValueChange={v => setWindows(v[0])} />
                <p className="text-[11px] text-muted-foreground">Passive solar: 20–30% south-facing · Conventional: 10–15%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Roof System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ROOF_SYSTEMS.map(r => (
                <button key={r.id} onClick={() => setRoofSystem(r.id)}
                  className={cn("w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                    roofSystem === r.id ? "bg-primary text-primary-foreground border-primary" : "border-border/40 hover:border-primary/40")}>
                  {r.name}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Floor System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FLOOR_SYSTEMS.map(f => (
                <button key={f.id} onClick={() => setFloorSystem(f.id)}
                  className={cn("w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                    floorSystem === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border/40 hover:border-primary/40")}>
                  {f.name}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Wall system picker + results */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Database className="h-4 w-4 text-accent" /> Wall System
              </CardTitle>
              <CardDescription>Click to compare materials. All figures include labour.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {WALL_SYSTEMS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setWallSystem(w.id)}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all space-y-1",
                      wallSystem === w.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/40 hover:border-primary/30"
                    )}
                  >
                    <p className="text-lg">{w.emoji}</p>
                    <p className="text-xs font-bold leading-tight">{w.name}</p>
                    <p className="text-[10px] text-muted-foreground">{w.description}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded">${w.costPerSqm}/m²</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded", w.carbonPerSqm < 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                        {w.carbonPerSqm < 0 ? "−" : "+"}{Math.abs(w.carbonPerSqm)} kg CO₂/m²
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Wall spec */}
              <div className="mt-4 p-3 bg-muted/40 rounded-lg grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Thickness</p>
                  <p className="text-sm font-bold">{wall.wallThicknessMm}mm</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">R-Value</p>
                  <p className="text-sm font-bold">R-{wall.rValue}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Wall Area</p>
                  <p className="text-sm font-bold">{result.netWallArea} m²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost breakdown */}
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" /> Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Walls", value: result.wallCost },
                { label: "Roof", value: result.roofCost },
                { label: "Floor", value: result.floorCost },
                { label: `Windows (${result.windowArea}m² triple-glazed)`, value: result.windowCost },
                { label: "Foundation / Groundwork", value: result.foundationCost },
                { label: "M&E, Finishes & Fitout (35%)", value: result.fitoutCost },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold">${value.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3">
                <span className="font-bold text-base">Total Estimate</span>
                <span className="text-2xl font-serif font-bold text-accent">${result.grandTotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">${result.costPerSqm}/m² · Indicative only, excludes land, permits & design fees</p>
            </CardContent>
          </Card>

          <Card className={cn("border", result.totalCarbon < 0 ? "border-green-300/50 bg-green-50/30" : "border-amber-300/50 bg-amber-50/30")}>
            <CardContent className="p-4 flex items-center gap-4">
              <Leaf className={cn("h-8 w-8 shrink-0", result.totalCarbon < 0 ? "text-green-600" : "text-amber-600")} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Embodied Carbon (Shell)</p>
                <p className={cn("text-2xl font-serif font-bold", result.totalCarbon < 0 ? "text-green-700" : "text-amber-700")}>
                  {result.totalCarbon < 0 ? "−" : "+"}{Math.abs(result.totalCarbon).toLocaleString()} kg CO₂e
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {result.totalCarbon < 0
                    ? "Carbon-negative shell — this building sequesters carbon!"
                    : "Consider switching to hempcrete or straw bale walls to go carbon-negative"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
