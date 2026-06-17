import { useState, useMemo } from "react";
import { Zap, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function calc(lat: number, panels: number) {
  const optimalTilt = Math.abs(lat) * 0.9 + 5;
  const peakSunHours = 4.5 - Math.abs(lat - 35) * 0.04;
  const annualKwh = Math.round(panels * 400 * peakSunHours * 365 * 0.78 / 1000);
  const saving = Math.round(annualKwh * 0.14);
  const co2 = Math.round(annualKwh * 0.386);
  const dailyKwh = (annualKwh / 365).toFixed(1);
  return { annualKwh, saving, co2, optimalTilt: Math.round(optimalTilt), dailyKwh, peakSunHours: peakSunHours.toFixed(1) };
}

export default function SolarMonitorWidget() {
  const [lat, setLat] = useState(35);
  const [panels, setPanels] = useState(12);
  const r = useMemo(() => calc(lat, panels), [lat, panels]);

  const selfSufficiency = Math.min(100, Math.round(r.annualKwh / 5000 * 100));

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Big number */}
      <div className="rounded-xl bg-amber-50 border border-amber-200/50 p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Annual Generation</p>
          <Zap className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-4xl font-serif font-bold text-amber-600">{r.annualKwh.toLocaleString()}</p>
        <p className="text-xs text-amber-600/80">kWh/yr · {r.dailyKwh} kWh/day avg</p>
      </div>

      {/* Sliders */}
      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Latitude</span>
            <span className="font-bold">{lat}° {lat >= 0 ? "N" : "S"}</span>
          </div>
          <Slider min={-65} max={65} step={1} value={[lat]} onValueChange={v => setLat(v[0])} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Panels (400W)</span>
            <span className="font-bold">{panels} = {(panels * 0.4).toFixed(1)} kW</span>
          </div>
          <Slider min={4} max={40} step={1} value={[panels]} onValueChange={v => setPanels(v[0])} />
        </div>
      </div>

      {/* Mini metrics row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Savings", value: `$${r.saving}`, color: "text-green-600" },
          { label: "CO₂ Offset", value: `${r.co2}kg`, color: "text-emerald-600" },
          { label: "Sufficiency", value: `${selfSufficiency}%`, color: "text-primary" },
        ].map(m => (
          <div key={m.label} className="text-center p-2 rounded-lg bg-muted/40 border border-border/30">
            <p className={cn("text-sm font-bold font-serif", m.color)}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Self-sufficiency bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Off-grid sufficiency</span>
          <span className="font-semibold">{selfSufficiency}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className={cn("h-2 rounded-full transition-all duration-500", selfSufficiency > 80 ? "bg-green-500" : selfSufficiency > 50 ? "bg-amber-500" : "bg-red-400")}
            style={{ width: `${selfSufficiency}%` }} />
        </div>
      </div>
    </div>
  );
}
