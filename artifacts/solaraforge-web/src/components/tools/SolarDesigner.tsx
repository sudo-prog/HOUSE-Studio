import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sun, TrendingUp, Zap, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const ORIENTATIONS = [
  { label: "South", deg: 180, factor: 1.0 },
  { label: "SE / SW", deg: 157, factor: 0.95 },
  { label: "E / W", deg: 90, factor: 0.80 },
  { label: "NE / NW", deg: 45, factor: 0.60 },
  { label: "North", deg: 0, factor: 0.40 },
];

function solarCalc(lat: number, pitch: number, orientFactor: number, panels: number) {
  // Simplified Pythagorean model (not real PVWatts, good enough for design guidance)
  const optimalTilt = Math.abs(lat) * 0.9 + 5;
  const tiltLoss = 1 - Math.abs(pitch - optimalTilt) * 0.004;
  const peakSunHours = 4.5 - Math.abs(lat - 35) * 0.04;
  const panelWatts = 400;
  const systemEff = 0.78;
  const annualKwh = panels * panelWatts * peakSunHours * 365 * systemEff * tiltLoss * orientFactor / 1000;
  const annualSaving = annualKwh * 0.14; // $0.14/kWh avg
  const co2Offset = annualKwh * 0.386; // kg CO2/kWh avg grid
  return { optimalTilt: Math.round(optimalTilt), annualKwh: Math.round(annualKwh), annualSaving: Math.round(annualSaving), co2Offset: Math.round(co2Offset), peakSunHours: peakSunHours.toFixed(1) };
}

export default function SolarDesigner() {
  const [lat, setLat] = useState(35);
  const [pitch, setPitch] = useState(30);
  const [panels, setPanels] = useState(12);
  const [orientIdx, setOrientIdx] = useState(0);

  const orient = ORIENTATIONS[orientIdx];
  const result = useMemo(() => solarCalc(lat, pitch, orient.factor, panels), [lat, pitch, orient.factor, panels]);
  const tiltDiff = Math.abs(pitch - result.optimalTilt);
  const tiltScore = Math.max(0, 100 - tiltDiff * 4);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5 text-accent" /> Solar Site Inputs
            </CardTitle>
            <CardDescription>Drag the sliders to match your site conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Your Latitude</Label>
                <Badge variant="outline">{lat}°{lat >= 0 ? "N" : "S"}</Badge>
              </div>
              <Slider min={-65} max={65} step={1} value={[lat]} onValueChange={v => setLat(v[0])}
                className="accent-amber-500" />
              <p className="text-[11px] text-muted-foreground">Sydney=−34 · London=51 · LA=34 · Nairobi=−1 · NYC=40</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Roof / Panel Pitch</Label>
                <Badge variant="outline">{pitch}°</Badge>
              </div>
              <Slider min={0} max={60} step={1} value={[pitch]} onValueChange={v => setPitch(v[0])} />
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", tiltScore > 80 ? "bg-green-500" : tiltScore > 50 ? "bg-amber-500" : "bg-red-400")} />
                <p className="text-[11px] text-muted-foreground">Optimal tilt for your latitude: <span className="font-semibold text-foreground">{result.optimalTilt}°</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Number of Panels (400W each)</Label>
                <Badge variant="outline">{panels} panels = {(panels * 0.4).toFixed(1)} kW</Badge>
              </div>
              <Slider min={4} max={40} step={1} value={[panels]} onValueChange={v => setPanels(v[0])} />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Roof / Array Orientation</Label>
              <div className="grid grid-cols-2 gap-2">
                {ORIENTATIONS.map((o, i) => (
                  <button
                    key={o.label}
                    onClick={() => setOrientIdx(i)}
                    className={cn(
                      "text-xs px-3 py-2 rounded-lg border transition-colors text-left",
                      orientIdx === i
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <Compass className="h-3 w-3 inline mr-1 opacity-60" />{o.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Annual Generation</p>
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <p className="text-5xl font-serif font-bold text-accent">{result.annualKwh.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">kWh per year · {result.peakSunHours} peak sun hrs/day</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-900/10">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Annual Savings</p>
                <p className="text-2xl font-serif font-bold text-green-700 dark:text-green-400">${result.annualSaving.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">at $0.14/kWh avg</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-900/10">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">CO₂ Offset</p>
                <p className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">{result.co2Offset.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">kg CO₂ / year</p>
              </CardContent>
            </Card>
          </div>

          {/* Tilt meter */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Tilt Efficiency Score</span>
                <span className={cn("font-bold", tiltScore > 80 ? "text-green-600" : tiltScore > 50 ? "text-amber-500" : "text-red-500")}>{Math.round(tiltScore)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={cn("h-3 rounded-full transition-all duration-500", tiltScore > 80 ? "bg-green-500" : tiltScore > 50 ? "bg-amber-500" : "bg-red-400")}
                  style={{ width: `${tiltScore}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {tiltScore > 90 ? "✓ Excellent tilt — near-optimal solar capture" :
                 tiltScore > 70 ? "Good tilt — minor losses acceptable for flat roofs" :
                 tiltScore > 50 ? "Consider adjustable racking to improve output" :
                 "Significant mismatch — tilt adjustment will greatly increase output"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Orientation Factor</p>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${orient.factor * 100}%` }} />
                </div>
                <span className="text-sm font-bold">{Math.round(orient.factor * 100)}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {orient.factor === 1 ? "South-facing is optimal in the northern hemisphere" :
                 orient.factor > 0.9 ? "Near-optimal — slight yield loss vs true south" :
                 orient.factor > 0.75 ? "Acceptable — morning/afternoon bias" :
                 "Significant yield reduction — re-orient panels if possible"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
          <p className="text-sm text-muted-foreground">
            At {panels} × 400W panels with your site conditions, you'll generate approximately{" "}
            <span className="font-semibold text-foreground">{result.annualKwh.toLocaleString()} kWh/year</span>.
            A typical off-grid cabin uses 3,000–6,000 kWh/yr. {result.annualKwh > 6000 ? "You have excellent surplus for battery storage or an EV." : result.annualKwh > 3000 ? "This covers a well-designed energy-efficient home." : "Consider adding panels or reducing loads with passive design."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
