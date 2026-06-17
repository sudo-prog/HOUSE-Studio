import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building, Layers, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ROOF_TYPES = [
  { id: "metal", label: "Metal / Tin", deadPsf: 5, icon: "🏚️" },
  { id: "shingle", label: "Asphalt Shingle", deadPsf: 12, icon: "🏠" },
  { id: "tile", label: "Clay / Concrete Tile", deadPsf: 22, icon: "🏡" },
  { id: "living", label: "Living / Green Roof", deadPsf: 80, icon: "🌿" },
  { id: "sod", label: "Sod / Earth Roof", deadPsf: 100, icon: "🌱" },
];

const SNOW_ZONES = [
  { id: "none", label: "None (tropical)", psf: 0 },
  { id: "light", label: "Light (5–15 psf)", psf: 10 },
  { id: "moderate", label: "Moderate (15–30 psf)", psf: 20 },
  { id: "heavy", label: "Heavy (30–50 psf)", psf: 40 },
  { id: "extreme", label: "Extreme (50+ psf)", psf: 60 },
];

const WALL_MATERIALS = [
  { id: "timber", label: "Timber Frame", selfPsf: 8 },
  { id: "sip", label: "SIP Panels", selfPsf: 10 },
  { id: "straw", label: "Straw Bale", selfPsf: 28 },
  { id: "adobe", label: "Adobe / Cob", selfPsf: 45 },
  { id: "rammed", label: "Rammed Earth", selfPsf: 90 },
  { id: "cmu", label: "CMU / Masonry", selfPsf: 85 },
];

function structCalc(span: number, floors: number, roofType: typeof ROOF_TYPES[0], snowZone: typeof SNOW_ZONES[0], wallMat: typeof WALL_MATERIALS[0]) {
  // All in psf (pounds per square foot), convert to kPa for display alongside
  const roofDead = roofType.deadPsf + 10; // + framing/insulation
  const roofLive = 20; // maintenance live load
  const roofSnow = snowZone.psf;
  const floorDead = 15; // flooring + framing
  const floorLive = 40; // residential

  const totalRoofLoad = roofDead + Math.max(roofLive, roofSnow); // snow & live don't combine at full
  const totalFloorLoad = (floorDead + floorLive) * Math.max(0, floors - 1);
  const wallLoad = wallMat.selfPsf * 9; // per linear ft, ~9ft wall height

  const totalDesignLoad = totalRoofLoad + totalFloorLoad; // psf on footprint

  // Simple beam sizing for given span (Fb = 1200 psi Douglas fir)
  // M = wL²/8 (w = load/ft, L = span)
  const w = totalDesignLoad * (span / 2); // tributary width = half span, lb/ft
  const moment = w * span * span / 8; // ft·lb
  const Fb = 1200; // psi allowable bending
  const Sreq = (moment * 12) / Fb; // in³ section modulus

  // Choose nearest standard timber: 2×8=13.1, 2×10=21.4, 2×12=31.6, 4×10=49.9, 6×10=82.7, 6×12=121.2
  const timbers = [
    { label: "2×8", S: 13.1 }, { label: "2×10", S: 21.4 }, { label: "2×12", S: 31.6 },
    { label: "Double 2×10", S: 42.8 }, { label: "4×10", S: 49.9 }, { label: "4×12", S: 73.8 },
    { label: "6×10", S: 82.7 }, { label: "6×12", S: 121.2 }, { label: "LVL 3.5×9.25", S: 49.9 },
    { label: "LVL 3.5×11.25", S: 73.8 }, { label: "Consult engineer", S: 999 },
  ];
  const beam = timbers.find(t => t.S >= Sreq) ?? timbers[timbers.length - 1];

  // Foundation load per linear foot of wall
  const foundationLoad = totalDesignLoad * (span / 2) + wallLoad;
  const footingWidth = Math.ceil(foundationLoad / 1500 * 12) / 12; // 1500 psf soil bearing

  // Safety check
  const safe = beam.label !== "Consult engineer";
  const totalKpa = totalDesignLoad * 0.0479; // psf → kPa

  return { totalDesignLoad: Math.round(totalDesignLoad), totalKpa: totalKpa.toFixed(1), Sreq: Math.round(Sreq), beam, foundationLoad: Math.round(foundationLoad), footingWidth: footingWidth.toFixed(2), safe, roofDead, roofSnow, totalFloorLoad: Math.round(totalFloorLoad) };
}

export default function StructuralLoadCalc() {
  const [span, setSpan] = useState(20); // feet
  const [floors, setFloors] = useState(1);
  const [roofIdx, setRoofIdx] = useState(0);
  const [snowIdx, setSnowIdx] = useState(1);
  const [wallIdx, setWallIdx] = useState(0);

  const r = useMemo(() => structCalc(span, floors, ROOF_TYPES[roofIdx], SNOW_ZONES[snowIdx], WALL_MATERIALS[wallIdx]), [span, floors, roofIdx, snowIdx, wallIdx]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-accent" /> Structure Inputs
            </CardTitle>
            <CardDescription>Enter your building parameters for a simplified structural load analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Roof / Floor Span</Label>
                <Badge variant="outline">{span} ft ({(span * 0.305).toFixed(1)} m)</Badge>
              </div>
              <Slider min={8} max={40} step={1} value={[span]} onValueChange={v => setSpan(v[0])} />
              <p className="text-[11px] text-muted-foreground">Distance between supporting walls or posts</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Number of Floors</Label>
                <Badge variant="outline">{floors} {floors === 1 ? "floor" : "floors"}</Badge>
              </div>
              <Slider min={1} max={3} step={1} value={[floors]} onValueChange={v => setFloors(v[0])} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Roof Type</Label>
              <div className="grid grid-cols-1 gap-1.5">
                {ROOF_TYPES.map((r, i) => (
                  <button key={r.id} onClick={() => setRoofIdx(i)} className={cn("text-xs px-3 py-2 rounded-lg border transition-colors text-left flex items-center gap-2", roofIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    <span>{r.icon}</span><span className="flex-1">{r.label}</span><span className="opacity-60">{r.deadPsf} psf dead</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Snow Load Zone</Label>
              <div className="grid grid-cols-1 gap-1.5">
                {SNOW_ZONES.map((s, i) => (
                  <button key={s.id} onClick={() => setSnowIdx(i)} className={cn("text-xs px-3 py-2 rounded-lg border transition-colors text-left flex items-center justify-between", snowIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    <span>{s.label}</span>{s.psf > 0 && <span className="opacity-60">{s.psf} psf</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Wall Material</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {WALL_MATERIALS.map((w, i) => (
                  <button key={w.id} onClick={() => setWallIdx(i)} className={cn("text-xs px-3 py-2 rounded-lg border transition-colors text-left", wallIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className={cn("border-2", r.safe ? "border-green-300 bg-green-50/30" : "border-red-300 bg-red-50/30")}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Design Load</p>
                {r.safe ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
              <p className="text-5xl font-serif font-bold">{r.totalDesignLoad} <span className="text-xl font-normal text-muted-foreground">psf</span></p>
              <p className="text-sm text-muted-foreground">{r.totalKpa} kPa — on structural footprint</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Load Breakdown</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Roof dead load</span><span className="font-mono font-semibold">{r.roofDead} psf</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Snow load</span><span className="font-mono font-semibold">{r.roofSnow} psf</span></div>
                {floors > 1 && <div className="flex justify-between"><span className="text-muted-foreground">Floor loads ({floors - 1} floor)</span><span className="font-mono font-semibold">{r.totalFloorLoad} psf</span></div>}
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono">{r.totalDesignLoad} psf</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className={cn("border", r.safe ? "border-green-200 bg-green-50/20" : "border-red-200 bg-red-50/20")}>
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-2">Recommended Beam</p>
                <p className={cn("text-xl font-serif font-bold", r.safe ? "text-green-700" : "text-red-600")}>{r.beam.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">S = {r.Sreq} in³ required</p>
                {!r.safe && <p className="text-[10px] text-red-600 mt-1 font-semibold">⚠ Engage a structural engineer</p>}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-2">Min. Footing Width</p>
                <p className="text-xl font-serif font-bold">{r.footingWidth} ft</p>
                <p className="text-[10px] text-muted-foreground mt-1">at 1500 psf soil bearing</p>
              </CardContent>
            </Card>
          </div>

          {!r.safe && (
            <Card className="border-red-300 bg-red-50/30">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">These loads exceed standard lumber tables. A licensed structural engineer must size and stamp the structural members before construction.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
          <p className="text-sm text-muted-foreground">
            A {span}ft span {ROOF_TYPES[roofIdx].label.toLowerCase()} roof with {SNOW_ZONES[snowIdx].label.toLowerCase()} snow loads produces a design load of <span className="font-semibold text-foreground">{r.totalDesignLoad} psf ({r.totalKpa} kPa)</span>.
            {r.safe
              ? ` A ${r.beam.label} beam at 16" spacing or similar will carry this span. Minimum footing width of ${r.footingWidth} ft assumes medium-density soil — test your soil before pouring.`
              : " This combination exceeds simplified span tables. Engage a structural engineer — the investment (~$1–3k) prevents catastrophic failure and unlocks permits."}
            {ROOF_TYPES[roofIdx].deadPsf > 50 ? " Living and earth roofs carry extreme dead loads — their thermal and ecological benefits are real, but structure must be engineered accordingly." : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
