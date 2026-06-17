import { useState, useMemo } from "react";
import { Leaf, Droplets, Recycle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function calc(people: number, season: number, sufficiency: number) {
  const calFromPlants = 2200 * 0.7 * (sufficiency / 100);
  const lbPerYear = calFromPlants * people * 365 / 150;
  const lbPerBedPerYear = 8 * season;
  const beds = Math.ceil(lbPerYear / lbPerBedPerYear);
  const waterGal = Math.round(beds * 32 * 0.62);
  const compostBins = Math.max(1, Math.ceil(beds / 4));
  const yieldKg = Math.round(lbPerBedPerYear * beds * 0.453);
  return { beds, waterGal, compostBins, yieldKg };
}

export default function GardenWidget() {
  const [people, setPeople] = useState(2);
  const [season, setSeason] = useState(24);
  const [sufficiency, setSufficiency] = useState(50);
  const r = useMemo(() => calc(people, season, sufficiency), [people, season, sufficiency]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Key metric */}
      <div className="rounded-xl bg-green-50 border border-green-200/50 p-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-serif font-bold text-green-700">{r.beds}</p>
          <p className="text-xs text-green-600">beds needed</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="text-center p-2 rounded-lg bg-white/60 border border-green-200/30">
            <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-0.5" />
            <p className="text-sm font-bold text-blue-600">{r.waterGal}</p>
            <p className="text-[9px] text-muted-foreground">gal/wk</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 border border-green-200/30">
            <Recycle className="h-4 w-4 text-amber-600 mx-auto mb-0.5" />
            <p className="text-sm font-bold text-amber-700">{r.compostBins}</p>
            <p className="text-[9px] text-muted-foreground">compost bins</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Estimated yield: <span className="font-semibold text-foreground">{r.yieldKg.toLocaleString()} kg/yr</span>
      </p>

      {/* Sliders */}
      <div className="flex-1 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">People to feed</span>
            <span className="font-semibold">{people}</span>
          </div>
          <Slider min={1} max={10} step={1} value={[people]} onValueChange={v => setPeople(v[0])} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Growing season</span>
            <span className="font-semibold">{season} weeks</span>
          </div>
          <Slider min={8} max={52} step={1} value={[season]} onValueChange={v => setSeason(v[0])} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Self-sufficiency goal</span>
            <span className="font-semibold">{sufficiency}%</span>
          </div>
          <Slider min={10} max={100} step={5} value={[sufficiency]} onValueChange={v => setSufficiency(v[0])} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Leaf className="h-3 w-3 text-green-600" /> Food independence</span>
          <span className="font-semibold text-green-600">{sufficiency}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="h-2 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${sufficiency}%` }} />
        </div>
      </div>
    </div>
  );
}
