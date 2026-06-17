import { useState, useEffect } from "react";
import { Battery, Sun, Zap, Wind } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Season = "summer" | "spring" | "winter" | "autumn";
const SEASON_FACTOR: Record<Season, number> = { summer: 1.0, spring: 0.82, autumn: 0.75, winter: 0.52 };

export default function PowerSystemWidget() {
  const [solarKw, setSolarKw] = useState(5);
  const [loadKw, setLoadKw] = useState(2.5);
  const [batteryKwh, setBatteryKwh] = useState(20);
  const [season, setSeason] = useState<Season>("spring");
  const [batteryPct, setBatteryPct] = useState(68);

  const factor = SEASON_FACTOR[season];
  const solarIn = solarKw * factor;
  const netFlow = solarIn - loadKw;
  const isCharging = netFlow > 0;
  const surplus = Math.abs(netFlow).toFixed(1);

  // Animate battery charge/discharge
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryPct(prev => {
        const delta = isCharging ? 0.3 : -0.3;
        return Math.min(100, Math.max(0, prev + delta));
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isCharging]);

  const battColor = batteryPct > 60 ? "bg-green-500" : batteryPct > 30 ? "bg-amber-500" : "bg-red-500";
  const hoursRemaining = loadKw > 0 && !isCharging ? (batteryPct / 100 * batteryKwh / loadKw).toFixed(1) : "∞";

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Battery + flow display */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-50 border border-amber-200/50">
          <Sun className="h-5 w-5 text-amber-500" />
          <p className="text-lg font-bold font-serif text-amber-600">{solarIn.toFixed(1)}</p>
          <p className="text-[9px] text-amber-700">kW solar in</p>
        </div>

        {/* Battery gauge */}
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/30 border border-border/30">
          <Battery className="h-5 w-5 text-primary" />
          <p className={cn("text-lg font-bold font-serif", batteryPct > 60 ? "text-green-600" : batteryPct > 30 ? "text-amber-600" : "text-red-600")}>{Math.round(batteryPct)}%</p>
          <p className="text-[9px] text-muted-foreground">{isCharging ? "charging ↑" : "discharging ↓"}</p>
        </div>

        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-red-50 border border-red-200/50">
          <Zap className="h-5 w-5 text-red-500" />
          <p className="text-lg font-bold font-serif text-red-600">{loadKw.toFixed(1)}</p>
          <p className="text-[9px] text-red-700">kW load</p>
        </div>
      </div>

      {/* Battery bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Battery ({batteryKwh} kWh bank)</span>
          <span className={cn("font-semibold", isCharging ? "text-green-600" : "text-amber-600")}>
            {isCharging ? `+${surplus} kW surplus` : `${hoursRemaining}h remaining`}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div className={cn("h-4 rounded-full transition-all duration-700", battColor)} style={{ width: `${batteryPct}%` }} />
        </div>
      </div>

      {/* Sliders */}
      <div className="flex-1 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Solar Array</span>
            <span className="font-semibold">{solarKw} kW peak</span>
          </div>
          <Slider min={1} max={20} step={0.5} value={[solarKw]} onValueChange={v => setSolarKw(v[0])} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Home Load</span>
            <span className="font-semibold">{loadKw} kW avg</span>
          </div>
          <Slider min={0.5} max={15} step={0.5} value={[loadKw]} onValueChange={v => setLoadKw(v[0])} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Battery Bank</span>
            <span className="font-semibold">{batteryKwh} kWh</span>
          </div>
          <Slider min={5} max={100} step={5} value={[batteryKwh]} onValueChange={v => setBatteryKwh(v[0])} />
        </div>
      </div>

      {/* Season selector */}
      <div className="grid grid-cols-4 gap-1">
        {(["summer", "spring", "autumn", "winter"] as Season[]).map(s => (
          <button key={s} onClick={() => setSeason(s)} className={cn("text-[10px] py-1 rounded-lg border capitalize font-medium transition-colors", season === s ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:border-primary/30")}>
            {s === "summer" ? "☀" : s === "spring" ? "🌸" : s === "autumn" ? "🍂" : "❄"} {s.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}
