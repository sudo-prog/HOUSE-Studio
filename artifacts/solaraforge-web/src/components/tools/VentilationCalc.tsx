import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wind, Thermometer, ArrowUpDown, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const CLIMATES = [
  { id: "hot-dry", label: "Hot & Dry", targetACH: 20, windSpeed: 8 },
  { id: "hot-humid", label: "Hot & Humid", targetACH: 30, windSpeed: 10 },
  { id: "temperate", label: "Temperate", targetACH: 10, windSpeed: 7 },
  { id: "cold", label: "Cold", targetACH: 6, windSpeed: 9 },
];

const STRATEGIES = [
  { id: "cross", label: "Cross-ventilation", icon: "↔️", factor: 0.6 },
  { id: "stack", label: "Stack effect", icon: "↕️", factor: 0.45 },
  { id: "single", label: "Single-sided", icon: "🪟", factor: 0.25 },
  { id: "combo", label: "Cross + Stack combo", icon: "✨", factor: 0.75 },
];

function ventCalc(floorArea: number, ceilHeight: number, climate: typeof CLIMATES[0], openings: number, strategy: typeof STRATEGIES[0], stackHeight: number) {
  const volume = floorArea * ceilHeight; // ft³
  const requiredACH = climate.targetACH;
  const requiredCfm = (requiredACH * volume) / 60;

  // Inlet area needed: Q = Cd × A × v;  Cd = 0.6, v in ft/s
  const windFps = climate.windSpeed * 1.467; // mph → ft/s
  const Cd = strategy.factor;
  const totalInletNeeded = requiredCfm / (Cd * windFps); // ft²
  const inletPerOpening = totalInletNeeded / Math.max(1, openings);

  // Stack effect flow: Q = Cd × A × sqrt(2 × g × h × ΔT/T)
  // Assume ΔT = 10°F inside-outside, T = 520 R (60°F)
  const g = 32.2;
  const h = stackHeight;
  const dT = 10;
  const T = 520;
  const stackVelocity = Math.sqrt(2 * g * h * dT / T);
  const stackCfm = Cd * totalInletNeeded * stackVelocity;

  const achievedCfm = requiredCfm * strategy.factor + (strategy.id === "stack" || strategy.id === "combo" ? stackCfm * 0.5 : 0);
  const achievedACH = (achievedCfm * 60) / volume;

  const meetsDemand = achievedACH >= requiredACH * 0.85;

  // Cooling equivalent in BTU/hr:  Q (cfm) × 1.1 × ΔT (assume 10°F relief)
  const coolingBtu = Math.round(achievedCfm * 1.1 * 10);

  // In m² for display
  const inletM2 = (totalInletNeeded * 0.0929).toFixed(2);
  const inletPerOpeningM2 = (inletPerOpening * 0.0929).toFixed(2);

  return {
    volume: Math.round(volume),
    requiredACH,
    requiredCfm: Math.round(requiredCfm),
    totalInletNeeded: totalInletNeeded.toFixed(1),
    inletM2,
    inletPerOpening: inletPerOpening.toFixed(1),
    inletPerOpeningM2,
    achievedACH: Math.round(achievedACH),
    meetsDemand,
    coolingBtu: coolingBtu.toLocaleString(),
    stackCfm: Math.round(stackCfm),
  };
}

export default function VentilationCalc() {
  const [floorArea, setFloorArea] = useState(800); // sqft
  const [ceilHeight, setCeilHeight] = useState(9); // ft
  const [openings, setOpenings] = useState(4);
  const [stackHeight, setStackHeight] = useState(8); // ft for clerestory/stack
  const [climateIdx, setClimateIdx] = useState(0);
  const [strategyIdx, setStrategyIdx] = useState(0);

  const r = useMemo(() => ventCalc(floorArea, ceilHeight, CLIMATES[climateIdx], openings, STRATEGIES[strategyIdx], stackHeight), [floorArea, ceilHeight, openings, stackHeight, climateIdx, strategyIdx]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Wind className="h-5 w-5 text-accent" /> Ventilation Inputs
            </CardTitle>
            <CardDescription>Size natural ventilation openings for comfort without mechanical cooling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Floor Area</Label>
                <Badge variant="outline">{floorArea} ft² ({(floorArea * 0.0929).toFixed(0)} m²)</Badge>
              </div>
              <Slider min={200} max={4000} step={50} value={[floorArea]} onValueChange={v => setFloorArea(v[0])} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Ceiling Height</Label>
                <Badge variant="outline">{ceilHeight} ft ({(ceilHeight * 0.305).toFixed(1)} m)</Badge>
              </div>
              <Slider min={7} max={20} step={0.5} value={[ceilHeight]} onValueChange={v => setCeilHeight(v[0])} />
              <p className="text-[11px] text-muted-foreground">Taller ceilings dramatically increase stack effect potential</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Number of Operable Windows / Vents</Label>
                <Badge variant="outline">{openings}</Badge>
              </div>
              <Slider min={1} max={20} step={1} value={[openings]} onValueChange={v => setOpenings(v[0])} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Stack / Clerestory Height</Label>
                <Badge variant="outline">{stackHeight} ft</Badge>
              </div>
              <Slider min={0} max={30} step={1} value={[stackHeight]} onValueChange={v => setStackHeight(v[0])} />
              <p className="text-[11px] text-muted-foreground">Vertical distance from low inlet to high exhaust vent</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Climate</Label>
              <div className="grid grid-cols-2 gap-2">
                {CLIMATES.map((c, i) => (
                  <button key={c.id} onClick={() => setClimateIdx(i)} className={cn("text-xs px-3 py-2 rounded-lg border transition-colors text-left", climateIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Ventilation Strategy</Label>
              <div className="grid grid-cols-1 gap-1.5">
                {STRATEGIES.map((s, i) => (
                  <button key={s.id} onClick={() => setStrategyIdx(i)} className={cn("text-xs px-3 py-2.5 rounded-lg border transition-colors text-left flex items-center gap-2", strategyIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    <span className="text-base">{s.icon}</span><span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className={cn("border-2", r.meetsDemand ? "border-green-300 bg-green-50/30" : "border-amber-300 bg-amber-50/30")}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Required Air Changes/hr</p>
                {r.meetsDemand ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              </div>
              <p className="text-5xl font-serif font-bold">{r.requiredACH} <span className="text-xl font-normal text-muted-foreground">ACH</span></p>
              <p className="text-sm text-muted-foreground">{r.requiredCfm.toLocaleString()} CFM for {r.volume.toLocaleString()} ft³ room volume</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wind className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Min Inlet Area</p>
                </div>
                <p className="text-xl font-serif font-bold">{r.totalInletNeeded} ft²</p>
                <p className="text-[10px] text-muted-foreground">{r.inletM2} m² total opening</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-green-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Per Opening</p>
                </div>
                <p className="text-xl font-serif font-bold">{r.inletPerOpening} ft²</p>
                <p className="text-[10px] text-muted-foreground">{r.inletPerOpeningM2} m² each window</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Thermometer className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Cooling Equiv.</p>
                </div>
                <p className="text-xl font-serif font-bold">{r.coolingBtu}</p>
                <p className="text-[10px] text-muted-foreground">BTU/hr natural cooling</p>
              </CardContent>
            </Card>
            <Card className={cn("border", r.meetsDemand ? "border-green-200 bg-green-50/20" : "border-amber-200 bg-amber-50/20")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wind className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Achieved ACH</p>
                </div>
                <p className={cn("text-xl font-serif font-bold", r.meetsDemand ? "text-green-700" : "text-amber-600")}>{r.achievedACH}</p>
                <p className="text-[10px] text-muted-foreground">{r.meetsDemand ? "✓ meets demand" : "↑ add openings"}</p>
              </CardContent>
            </Card>
          </div>

          {!r.meetsDemand && (
            <Card className="border-amber-300 bg-amber-50/30">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Current openings can't meet demand. Add more operable windows, raise the ceiling, or switch to Cross + Stack strategy. A ceiling fan or ERV (energy recovery ventilator) can bridge the gap.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
          <p className="text-sm text-muted-foreground">
            A {floorArea} ft² home in a {CLIMATES[climateIdx].label.toLowerCase()} climate needs <span className="font-semibold text-foreground">{r.requiredACH} air changes per hour</span> — that's {r.requiredCfm.toLocaleString()} CFM of airflow.
            Using {STRATEGIES[strategyIdx].label.toLowerCase()}, you need at least <span className="font-semibold text-foreground">{r.totalInletNeeded} ft² ({r.inletM2} m²)</span> of total inlet opening — about {r.inletPerOpening} ft² per window.
            {r.meetsDemand ? " Your configuration meets the target. Pair with exterior shading and thermal mass for best results." : " Increase openings or ceiling height, or supplement with a ceiling fan (uses just 50–75W vs. 1,000+W for AC)."}
            {stackHeight > 12 ? " Your generous stack height provides significant buoyancy-driven flow even on still days — excellent design." : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
