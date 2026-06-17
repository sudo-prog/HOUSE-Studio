import { useMemo } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Compass, Sun, Wind, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const CLIMATES = [
  { id: "hot-dry", label: "Hot & Dry", icon: "☀️", wwr: 0.06 },
  { id: "hot-humid", label: "Hot & Humid", icon: "💧", wwr: 0.08 },
  { id: "temperate", label: "Temperate", icon: "🌤️", wwr: 0.10 },
  { id: "cold", label: "Cold", icon: "❄️", wwr: 0.12 },
];

function orientCalc(lat: number, rotDeg: number, wwr: number, climate: typeof CLIMATES[0]) {
  // Optimal south orientation (northern hemisphere) = 180°, south hemi = 0°
  const hemisphere = lat >= 0 ? 180 : 0;
  const angleDiff = Math.abs(((rotDeg - hemisphere + 360) % 360));
  const normalised = angleDiff > 180 ? 360 - angleDiff : angleDiff;

  // Passive solar score 0–100
  const orientScore = Math.max(0, 100 - normalised * 1.1);

  // Optimal overhang ratio for summer shade / winter sun (based on lat)
  const absLat = Math.abs(lat);
  const overhangRatio = Math.tan((absLat + 10) * Math.PI / 180).toFixed(2);

  // Recommended south window area as % of floor (by climate)
  const southWWR = climate.wwr;

  // Overheating risk (east/west facades + high wwr)
  const eastWestFacing = (normalised > 60 && normalised < 120) || (normalised > 240 && normalised < 300);
  const overheatRisk = eastWestFacing || wwr > 0.15
    ? "High" : wwr > 0.10 ? "Moderate" : "Low";

  // Daylighting quality
  const daylightScore = orientScore > 80 && wwr >= 0.08 ? "Excellent"
    : orientScore > 60 && wwr >= 0.06 ? "Good"
    : orientScore > 40 ? "Fair"
    : "Poor";

  // Winter solar gain estimate (W/m² · 8h · 180 days / 1000 = kWh/m² season)
  const winterGain = Math.round(orientScore / 100 * 350 * wwr * 8 * 180 / 1000);

  return { orientScore: Math.round(orientScore), overhangRatio, southWWR, overheatRisk, daylightScore, winterGain, normalised };
}

export default function SiteOrientationAnalyzer() {
  const [lat, setLat] = useState(35);
  const [rotation, setRotation] = useState(180);
  const [wwr, setWwr] = useState(10); // percent
  const [climateIdx, setClimateIdx] = useState(2);

  const climate = CLIMATES[climateIdx];
  const r = useMemo(() => orientCalc(lat, rotation, wwr / 100, climate), [lat, rotation, wwr, climate]);

  const cardinalLabel = (deg: number) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Compass className="h-5 w-5 text-accent" /> Site & Building Inputs
            </CardTitle>
            <CardDescription>Set your location, building rotation, and window strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Latitude</Label>
                <Badge variant="outline">{lat}° {lat >= 0 ? "N" : "S"}</Badge>
              </div>
              <Slider min={-65} max={65} step={1} value={[lat]} onValueChange={v => setLat(v[0])} />
              <p className="text-[11px] text-muted-foreground">Sydney=−34 · London=51 · LA=34 · Nairobi=−1</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Building Rotation (main façade faces)</Label>
                <Badge variant="outline">{rotation}° {cardinalLabel(rotation)}</Badge>
              </div>
              <Slider min={0} max={359} step={5} value={[rotation]} onValueChange={v => setRotation(v[0])} />
              <p className="text-[11px] text-muted-foreground">0°=North · 90°=East · 180°=South · 270°=West</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Window-to-Wall Ratio (WWR)</Label>
                <Badge variant="outline">{wwr}%</Badge>
              </div>
              <Slider min={4} max={30} step={1} value={[wwr]} onValueChange={v => setWwr(v[0])} />
              <p className="text-[11px] text-muted-foreground">Recommended for your climate: <span className="font-semibold text-foreground">{Math.round(climate.wwr * 100)}%</span></p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Climate Zone</Label>
              <div className="grid grid-cols-2 gap-2">
                {CLIMATES.map((c, i) => (
                  <button key={c.id} onClick={() => setClimateIdx(i)} className={cn(
                    "text-xs px-3 py-2.5 rounded-lg border transition-colors text-left",
                    climateIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50"
                  )}>
                    <span className="mr-1.5">{c.icon}</span>{c.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className={cn("border-2", r.orientScore > 80 ? "border-green-300 bg-green-50/30" : r.orientScore > 55 ? "border-amber-300 bg-amber-50/30" : "border-red-300 bg-red-50/30")}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Orientation Score</p>
                <Compass className={cn("h-4 w-4", r.orientScore > 80 ? "text-green-600" : r.orientScore > 55 ? "text-amber-500" : "text-red-500")} />
              </div>
              <p className={cn("text-5xl font-serif font-bold", r.orientScore > 80 ? "text-green-700" : r.orientScore > 55 ? "text-amber-600" : "text-red-600")}>{r.orientScore}<span className="text-xl">/100</span></p>
              <div className="w-full bg-muted rounded-full h-3">
                <div className={cn("h-3 rounded-full transition-all duration-500", r.orientScore > 80 ? "bg-green-500" : r.orientScore > 55 ? "bg-amber-500" : "bg-red-400")} style={{ width: `${r.orientScore}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {r.orientScore > 85 ? "✓ Excellent — near-optimal passive solar orientation" : r.orientScore > 65 ? "Good — slight loss vs. true solar south; acceptable" : r.orientScore > 45 ? "Fair — rotate 15–30° toward solar south for gains" : "Poor — reorient building to reduce energy loads significantly"}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Winter Solar Gain</p>
                </div>
                <p className="text-2xl font-serif font-bold">{r.winterGain}</p>
                <p className="text-[10px] text-muted-foreground">kWh/m² per heating season</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Daylighting</p>
                </div>
                <p className="text-2xl font-serif font-bold">{r.daylightScore}</p>
                <p className="text-[10px] text-muted-foreground">quality at {wwr}% WWR</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sun className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Overheating Risk</p>
                </div>
                <p className={cn("text-2xl font-serif font-bold", r.overheatRisk === "Low" ? "text-green-600" : r.overheatRisk === "Moderate" ? "text-amber-600" : "text-red-600")}>{r.overheatRisk}</p>
                <p className="text-[10px] text-muted-foreground">summer thermal stress</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wind className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Overhang Ratio</p>
                </div>
                <p className="text-2xl font-serif font-bold">{r.overhangRatio}</p>
                <p className="text-[10px] text-muted-foreground">projection ÷ window height</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
          <p className="text-sm text-muted-foreground">
            Your main façade faces <span className="font-semibold text-foreground">{cardinalLabel(rotation)}</span> with a {wwr}% window-to-wall ratio in a {climate.label.toLowerCase()} climate.
            {r.orientScore > 80
              ? ` This is excellent passive solar design — you'll capture maximum winter sun and can rely on natural light. Set your south overhang at ${r.overhangRatio}× window height to block the high summer sun while admitting low winter sun.`
              : r.orientScore > 55
              ? ` Rotate your building ${Math.round(r.normalised / 2)}° toward solar south to improve passive gains. Your overhang ratio of ${r.overhangRatio} is a good starting point for shading south-facing glass.`
              : ` This orientation will significantly increase cooling and heating loads. Prioritise shading, high-performance glazing, and mechanical ventilation to compensate.`
            }
            {wwr / 100 > climate.wwr * 1.3 ? " Reduce window area on non-solar facades to lower heat loss and glare." : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
