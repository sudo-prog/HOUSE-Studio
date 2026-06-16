import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Thermometer, TrendingDown, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Zone {
  id: string; label: string; emoji: string; minTemp: number; maxTemp: number;
  heatingDegDays: number; coolingDegDays: number;
  wallRTarget: number; roofRTarget: number; floorRTarget: number;
}

const CLIMATE_ZONES: Zone[] = [
  { id: "subarctic", label: "Subarctic / Very Cold", emoji: "🥶", minTemp: -30, maxTemp: 15, heatingDegDays: 8000, coolingDegDays: 50, wallRTarget: 8, roofRTarget: 12, floorRTarget: 6 },
  { id: "cold", label: "Cold (Zone 5–6)", emoji: "❄", minTemp: -15, maxTemp: 22, heatingDegDays: 4500, coolingDegDays: 300, wallRTarget: 5.5, roofRTarget: 9, floorRTarget: 4 },
  { id: "mixed", label: "Mixed (Zone 4)", emoji: "🌤", minTemp: -5, maxTemp: 30, heatingDegDays: 2500, coolingDegDays: 700, wallRTarget: 4, roofRTarget: 7, floorRTarget: 3 },
  { id: "warm", label: "Warm / Temperate", emoji: "🌿", minTemp: 5, maxTemp: 35, heatingDegDays: 1200, coolingDegDays: 1500, wallRTarget: 3, roofRTarget: 5, floorRTarget: 2.5 },
  { id: "hot-dry", label: "Hot & Dry", emoji: "☀", minTemp: 10, maxTemp: 42, heatingDegDays: 400, coolingDegDays: 3000, wallRTarget: 2.5, roofRTarget: 6, floorRTarget: 1.5 },
  { id: "hot-humid", label: "Hot & Humid", emoji: "🌊", minTemp: 18, maxTemp: 38, heatingDegDays: 100, coolingDegDays: 4000, wallRTarget: 2, roofRTarget: 5, floorRTarget: 1 },
];

interface Material {
  name: string; rPerMm: number; costPerSqm100mm: number; carbon: string; tags: string[];
}

const INSULATION_MATERIALS: Material[] = [
  { name: "Sheep's Wool Batts", rPerMm: 0.037, costPerSqm100mm: 18, carbon: "Low (natural)", tags: ["breathable","natural","no-PPE"] },
  { name: "Flax / Hemp Batts", rPerMm: 0.038, costPerSqm100mm: 20, carbon: "Carbon-negative", tags: ["natural","compostable","EU-sourced"] },
  { name: "Cork Board", rPerMm: 0.040, costPerSqm100mm: 35, carbon: "Carbon-negative", tags: ["rigid","thermal bridge","moisture-resistant"] },
  { name: "Straw Bale (wall)", rPerMm: 0.052, costPerSqm100mm: 12, carbon: "Carbon-negative", tags: ["structural","thick","airtight-plastered"] },
  { name: "Cellulose (blown)", rPerMm: 0.038, costPerSqm100mm: 14, carbon: "Low (recycled paper)", tags: ["blown-in","gaps filled","retrofit"] },
  { name: "Wood Fibre Board", rPerMm: 0.040, costPerSqm100mm: 22, carbon: "Low", tags: ["rigid","breathable","acoustic"] },
  { name: "Mineral Wool (Rock)", rPerMm: 0.032, costPerSqm100mm: 10, carbon: "Moderate", tags: ["fire-resistant","cheap","widely available"] },
  { name: "Recycled PET Batts", rPerMm: 0.035, costPerSqm100mm: 13, carbon: "Low (recycled plastic)", tags: ["non-itchy","DIY-friendly","budget"] },
  { name: "Mycelium Panel", rPerMm: 0.030, costPerSqm100mm: 45, carbon: "Carbon-negative", tags: ["compostable","innovative","grown-not-made"] },
  { name: "Aerogel (premium)", rPerMm: 0.100, costPerSqm100mm: 180, carbon: "High (manufacturing)", tags: ["thin","ultra-high R","thermal bridges"] },
];

export default function InsulationWizard() {
  const [zoneId, setZoneId] = useState("mixed");
  const [wallMat, setWallMat] = useState("Sheep's Wool Batts");
  const [roofMat, setRoofMat] = useState("Cellulose (blown)");
  const [wallMm, setWallMm] = useState(150);
  const [roofMm, setRoofMm] = useState(250);
  const [floorMm, setFloorMm] = useState(100);
  const [floorMat, setFloorMat] = useState("Cork Board");
  const [floorArea, setFloorArea] = useState(80);

  const zone = CLIMATE_ZONES.find(z => z.id === zoneId)!;
  const wallM = INSULATION_MATERIALS.find(m => m.name === wallMat)!;
  const roofM = INSULATION_MATERIALS.find(m => m.name === roofMat)!;
  const floorM = INSULATION_MATERIALS.find(m => m.name === floorMat)!;

  const result = useMemo(() => {
    const wallR = wallMm * wallM.rPerMm;
    const roofR = roofMm * roofM.rPerMm;
    const floorR = floorMm * floorM.rPerMm;

    const wallOk = wallR >= zone.wallRTarget;
    const roofOk = roofR >= zone.roofRTarget;
    const floorOk = floorR >= zone.floorRTarget;

    const perimeter = Math.sqrt(floorArea) * 4;
    const wallArea = perimeter * 2.7;
    const roofArea = floorArea * 1.1;

    const wallCost = wallArea * wallM.costPerSqm100mm * (wallMm / 100);
    const roofCost = roofArea * roofM.costPerSqm100mm * (roofMm / 100);
    const floorCost = floorArea * floorM.costPerSqm100mm * (floorMm / 100);

    const heatingEnergy = (zone.heatingDegDays * 24 * floorArea * 0.6) / ((wallR + roofR + floorR) / 3 * 1000);
    const coolingEnergy = (zone.coolingDegDays * 24 * floorArea * 0.4) / ((wallR + roofR) / 2 * 1000);
    const annualHeatingCost = heatingEnergy * 0.08;
    const annualCoolingCost = coolingEnergy * 0.14;

    return { wallR: wallR.toFixed(1), roofR: roofR.toFixed(1), floorR: floorR.toFixed(1), wallOk, roofOk, floorOk,
      wallCost: Math.round(wallCost), roofCost: Math.round(roofCost), floorCost: Math.round(floorCost),
      totalCost: Math.round(wallCost + roofCost + floorCost),
      annualHeatingCost: Math.round(annualHeatingCost), annualCoolingCost: Math.round(annualCoolingCost),
      allOk: wallOk && roofOk && floorOk };
  }, [zone, wallMm, roofMm, floorMm, wallM, roofM, floorM, floorArea]);

  const RCheck = ({ ok, current, target, label }: { ok: boolean; current: string; target: number; label: string }) => (
    <div className={cn("flex items-center justify-between p-3 rounded-lg border", ok ? "border-green-200/60 bg-green-50/40" : "border-amber-200/60 bg-amber-50/40")}>
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span className={cn("text-sm font-bold", ok ? "text-green-700" : "text-amber-600")}>R-{current}</span>
        <span className="text-[10px] text-muted-foreground ml-1">/ target R-{target}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Zone picker */}
        <div className="space-y-5">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-400" /> Climate Zone
              </CardTitle>
              <CardDescription>Select the climate where you're building</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {CLIMATE_ZONES.map(z => (
                <button key={z.id} onClick={() => setZoneId(z.id)}
                  className={cn("w-full text-left px-3 py-2.5 rounded-lg border transition-colors",
                    zoneId === z.id ? "bg-primary text-primary-foreground border-primary" : "border-border/40 hover:border-primary/40")}>
                  <span className="mr-2">{z.emoji}</span>
                  <span className="text-sm font-medium">{z.label}</span>
                  <div className={cn("text-[10px] mt-0.5", zoneId === z.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {z.minTemp}° to {z.maxTemp}°C
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base">Floor Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-semibold">Area</Label>
                  <Badge variant="outline">{floorArea} m²</Badge>
                </div>
                <Slider min={20} max={300} step={5} value={[floorArea]} onValueChange={v => setFloorArea(v[0])} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spec pickers */}
        <div className="space-y-5">
          {[
            { label: "Wall Insulation", mat: wallMat, setMat: setWallMat, mm: wallMm, setMm: setWallMm, maxMm: 400 },
            { label: "Roof Insulation", mat: roofMat, setMat: setRoofMat, mm: roofMm, setMm: setRoofMm, maxMm: 600 },
            { label: "Floor Insulation", mat: floorMat, setMat: setFloorMat, mm: floorMm, setMm: setFloorMm, maxMm: 300 },
          ].map(({ label, mat, setMat, mm, setMm, maxMm }) => {
            const m = INSULATION_MATERIALS.find(x => x.name === mat)!;
            const rAchieved = (mm * m.rPerMm).toFixed(1);
            return (
              <Card key={label} className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base">{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select
                    value={mat}
                    onChange={e => setMat(e.target.value)}
                    className="w-full text-sm border border-border/50 rounded-lg px-2 py-2 bg-background"
                  >
                    {INSULATION_MATERIALS.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map(t => <Badge key={t} variant="secondary" className="text-[9px] px-1.5">{t}</Badge>)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs font-semibold">Thickness</Label>
                      <Badge variant="outline" className="text-[10px]">{mm}mm → R-{rAchieved}</Badge>
                    </div>
                    <Slider min={50} max={maxMm} step={25} value={[mm]} onValueChange={v => setMm(v[0])} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{m.carbon}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card className={cn("border-2", result.allOk ? "border-green-300/60 bg-green-50/30" : "border-amber-300/60 bg-amber-50/30")}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                {result.allOk
                  ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                  : <AlertCircle className="h-5 w-5 text-amber-500" />}
                <p className="font-semibold text-sm">
                  {result.allOk ? "Building meets climate targets" : "Increase some insulation thicknesses"}
                </p>
              </div>
              <div className="space-y-2">
                <RCheck ok={result.wallOk} current={result.wallR} target={zone.wallRTarget} label="Wall" />
                <RCheck ok={result.roofOk} current={result.roofR} target={zone.roofRTarget} label="Roof / Ceiling" />
                <RCheck ok={result.floorOk} current={result.floorR} target={zone.floorRTarget} label="Floor" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" /> Energy Cost Estimate
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Heating</p>
                  <p className="text-lg font-serif font-bold">${result.annualHeatingCost}</p>
                  <p className="text-[9px] text-muted-foreground">/year</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Cooling</p>
                  <p className="text-lg font-serif font-bold">${result.annualCoolingCost}</p>
                  <p className="text-[9px] text-muted-foreground">/year</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Simplified estimate — real savings depend on airtightness, ventilation, and occupant behaviour</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Insulation Material Cost</p>
              {[
                { label: "Walls", value: result.wallCost },
                { label: "Roof / Ceiling", value: result.roofCost },
                { label: "Floor", value: result.floorCost },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-border/20 last:border-0 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">${value.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold">
                <span>Total (materials + install)</span>
                <span className="text-accent">${result.totalCost.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex gap-2">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Airtightness matters more than R-value above a certain threshold. Always pair insulation with a continuous air barrier, HRV/ERV mechanical ventilation, and thermal bridge elimination at junctions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
