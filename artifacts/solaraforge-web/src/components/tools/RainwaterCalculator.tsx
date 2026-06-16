import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Droplets, Home, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CLIMATES = [
  { id: "tropical", label: "Tropical / Monsoon", emoji: "🌴", annualMm: 2000, description: "SE Asia, N. Australia, Central Africa" },
  { id: "humid-temperate", label: "Humid Temperate", emoji: "🌧", annualMm: 1100, description: "UK, NW Europe, NE USA, Japan" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🌿", annualMm: 600, description: "S. Europe, California, SW Australia" },
  { id: "semi-arid", label: "Semi-Arid", emoji: "🌵", annualMm: 350, description: "SW USA, S. Africa, Central Australia" },
  { id: "arid", label: "Arid / Desert", emoji: "☀", annualMm: 150, description: "Sahara, Arabian Peninsula, Atacama" },
  { id: "continental", label: "Continental", emoji: "❄", annualMm: 500, description: "Central USA, Central Europe, Russia" },
];

const USES = [
  { id: "toilet", label: "Toilet flushing", lPerPersonDay: 50 },
  { id: "laundry", label: "Laundry", lPerPersonDay: 30 },
  { id: "garden", label: "Garden irrigation (per 100m²)", lPerPersonDay: 120, perArea: true },
  { id: "drinking", label: "Drinking & cooking", lPerPersonDay: 8 },
  { id: "shower", label: "Showers & bathing", lPerPersonDay: 65 },
];

export default function RainwaterCalculator() {
  const [roofArea, setRoofArea] = useState(80);
  const [climateId, setClimateId] = useState("humid-temperate");
  const [people, setPeople] = useState(2);
  const [gardenArea, setGardenArea] = useState(50);
  const [selectedUses, setSelectedUses] = useState<string[]>(["toilet", "laundry", "garden"]);
  const [tankSize, setTankSize] = useState(10000);

  const climate = CLIMATES.find(c => c.id === climateId)!;

  const toggleUse = (id: string) => {
    setSelectedUses(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const result = useMemo(() => {
    const runoffCoeff = 0.85; // typical roof
    const annualHarvestL = roofArea * climate.annualMm * runoffCoeff;
    const monthlyHarvestL = annualHarvestL / 12;

    const dailyDemandL = USES
      .filter(u => selectedUses.includes(u.id))
      .reduce((acc, u) => {
        if (u.id === "garden") return acc + (gardenArea / 100) * u.lPerPersonDay;
        return acc + u.lPerPersonDay * people;
      }, 0);
    const annualDemandL = dailyDemandL * 365;
    const surplus = annualHarvestL - annualDemandL;
    const selfSufficiency = Math.min(100, Math.round((annualHarvestL / annualDemandL) * 100));
    const daysStorageAtDemand = tankSize / dailyDemandL;

    // Dry-season worst case: assume 3 dry months = 25% of annual rain
    const drySeasonHarvest = annualHarvestL * 0.25;
    const drySeasonDemand = dailyDemandL * 90;
    const drySeasonOk = tankSize + drySeasonHarvest >= drySeasonDemand;

    return {
      annualHarvestL: Math.round(annualHarvestL),
      monthlyHarvestL: Math.round(monthlyHarvestL),
      dailyDemandL: Math.round(dailyDemandL),
      annualDemandL: Math.round(annualDemandL),
      surplus: Math.round(surplus),
      selfSufficiency,
      daysStorageAtDemand: Math.round(daysStorageAtDemand),
      drySeasonOk,
      recommendedTank: Math.round(dailyDemandL * 60), // 60-day buffer
    };
  }, [roofArea, climate, people, gardenArea, selectedUses, tankSize]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Climate */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" /> Your Climate
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {CLIMATES.map(c => (
                <button key={c.id} onClick={() => setClimateId(c.id)}
                  className={cn("text-left p-3 rounded-xl border-2 transition-all",
                    climateId === c.id ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20" : "border-border/40 hover:border-blue-300/50")}>
                  <p className="text-xl">{c.emoji}</p>
                  <p className="text-xs font-bold mt-1 leading-tight">{c.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{c.annualMm}mm/yr</p>
                  <p className="text-[9px] text-muted-foreground">{c.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Roof + Household */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" /> Your Catchment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Roof Catchment Area</Label>
                  <Badge variant="outline">{roofArea} m²</Badge>
                </div>
                <Slider min={20} max={400} step={5} value={[roofArea]} onValueChange={v => setRoofArea(v[0])} />
                <p className="text-[11px] text-muted-foreground">Use the footprint of your roof (plan view area)</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Household Size</Label>
                  <Badge variant="outline">{people} {people === 1 ? "person" : "people"}</Badge>
                </div>
                <Slider min={1} max={10} step={1} value={[people]} onValueChange={v => setPeople(v[0])} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Garden / Food Forest Area</Label>
                  <Badge variant="outline">{gardenArea} m²</Badge>
                </div>
                <Slider min={0} max={500} step={10} value={[gardenArea]} onValueChange={v => setGardenArea(v[0])} />
              </div>
            </CardContent>
          </Card>

          {/* Uses */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Water Uses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {USES.map(u => (
                <button key={u.id} onClick={() => toggleUse(u.id)}
                  className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                    selectedUses.includes(u.id)
                      ? "bg-blue-50/60 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600"
                      : "border-border/40 text-muted-foreground hover:border-blue-200")}>
                  <div className="flex items-center gap-2">
                    {selectedUses.includes(u.id)
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40 shrink-0" />}
                    <span>{u.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{u.lPerPersonDay}L/day{u.id === "garden" ? "/100m²" : "/person"}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Self-sufficiency gauge */}
          <Card className="border-blue-200/50 bg-blue-50/30 dark:bg-blue-900/10">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Water Self-Sufficiency</p>
                <Badge className={cn(result.selfSufficiency >= 100 ? "bg-green-600" : result.selfSufficiency >= 70 ? "bg-amber-500" : "bg-red-500")}>
                  {result.selfSufficiency >= 100 ? "Surplus" : "Deficit"}
                </Badge>
              </div>
              <p className="text-6xl font-serif font-bold text-blue-600 dark:text-blue-400">{Math.min(result.selfSufficiency, 100)}%</p>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div className={cn("h-3 rounded-full transition-all duration-700",
                  result.selfSufficiency >= 100 ? "bg-green-500" : result.selfSufficiency >= 70 ? "bg-amber-500" : "bg-red-400")}
                  style={{ width: `${Math.min(result.selfSufficiency, 100)}%` }} />
              </div>
              {result.surplus > 0
                ? <p className="text-sm text-green-700 dark:text-green-400 font-medium">Surplus: {(result.surplus / 1000).toFixed(1)} kL/year — ideal for greywater reuse or neighbour sharing</p>
                : <p className="text-sm text-red-600 font-medium">Deficit: {Math.abs(result.surplus / 1000).toFixed(1)} kL/year — supplement with borewell or municipal supply</p>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Annual Harvest</p>
                <p className="text-xl font-serif font-bold">{(result.annualHarvestL / 1000).toFixed(1)} kL</p>
                <p className="text-[10px] text-muted-foreground mt-1">{(result.monthlyHarvestL / 1000).toFixed(1)} kL/month avg</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Daily Demand</p>
                <p className="text-xl font-serif font-bold">{result.dailyDemandL} L</p>
                <p className="text-[10px] text-muted-foreground mt-1">{(result.annualDemandL / 1000).toFixed(1)} kL/year total</p>
              </CardContent>
            </Card>
          </div>

          {/* Tank sizing */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base">Tank Sizing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Your Tank Size</Label>
                  <Badge variant="outline">{(tankSize / 1000).toFixed(0)} kL</Badge>
                </div>
                <Slider min={1000} max={100000} step={1000} value={[tankSize]} onValueChange={v => setTankSize(v[0])} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs font-semibold">Days of storage at demand</p>
                  <p className="text-2xl font-serif font-bold">{result.daysStorageAtDemand} days</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Recommended minimum</p>
                  <p className="text-sm font-bold">{(result.recommendedTank / 1000).toFixed(1)} kL</p>
                </div>
              </div>
              <div className={cn("flex items-start gap-2 p-3 rounded-lg text-sm",
                result.drySeasonOk ? "bg-green-50/50 border border-green-200/60" : "bg-red-50/50 border border-red-200/60")}>
                {result.drySeasonOk
                  ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  : <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                <p className={result.drySeasonOk ? "text-green-700 dark:text-green-400" : "text-red-600"}>
                  {result.drySeasonOk
                    ? "Dry-season resilient — your tank will bridge a 3-month dry period"
                    : "Increase tank size — your storage may run out during a dry season"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
              <p className="text-sm text-muted-foreground">
                First-flush diverters (discard first 1L/m² per rainfall event) and pre-filter mesh are non-negotiable for potable-quality water.
                Always get a lab test before drinking untreated rainwater.
                For drinking water, budget a UV + carbon filter: approx $800–2,000 installed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
