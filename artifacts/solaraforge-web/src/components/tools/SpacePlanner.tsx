import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { LayoutDashboard, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  areaSqft: number;
  category: "living" | "sleeping" | "service" | "outdoor";
}

const PRESETS: Omit<Room, "id">[] = [
  { name: "Living / Lounge", areaSqft: 250, category: "living" },
  { name: "Kitchen + Dining", areaSqft: 200, category: "living" },
  { name: "Primary Bedroom", areaSqft: 180, category: "sleeping" },
  { name: "Bathroom", areaSqft: 60, category: "service" },
  { name: "Utility / Laundry", areaSqft: 50, category: "service" },
];

const CATEGORY_COLORS: Record<Room["category"], string> = {
  living: "bg-blue-100 text-blue-700 border-blue-200",
  sleeping: "bg-purple-100 text-purple-700 border-purple-200",
  service: "bg-orange-100 text-orange-700 border-orange-200",
  outdoor: "bg-green-100 text-green-700 border-green-200",
};

const CATEGORY_LABELS: Record<Room["category"], string> = {
  living: "Living", sleeping: "Sleeping", service: "Service", outdoor: "Outdoor",
};

let idCounter = 100;

export default function SpacePlanner() {
  const [rooms, setRooms] = useState<Room[]>(() =>
    PRESETS.map((p, i) => ({ ...p, id: String(i) }))
  );
  const [targetSqft, setTargetSqft] = useState(800);
  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState(100);
  const [newCat, setNewCat] = useState<Room["category"]>("living");

  const totalNet = useMemo(() => rooms.reduce((s, r) => s + r.areaSqft, 0), [rooms]);
  // Gross area = net + ~20% for walls, corridors, structure
  const gross = Math.round(totalNet * 1.22);
  const grossSqM = (gross * 0.0929).toFixed(0);
  const surplusDeficit = targetSqft - gross;
  const efficiency = Math.min(100, Math.round((totalNet / gross) * 100));

  const addRoom = () => {
    if (!newName.trim()) return;
    setRooms(prev => [...prev, { id: String(++idCounter), name: newName.trim(), areaSqft: newArea, category: newCat }]);
    setNewName("");
    setNewArea(100);
  };

  const removeRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));

  const updateArea = (id: string, area: number) =>
    setRooms(prev => prev.map(r => r.id === id ? { ...r, areaSqft: area } : r));

  const byCategory = (cat: Room["category"]) => rooms.filter(r => r.category === cat);

  const categories: Room["category"][] = ["living", "sleeping", "service", "outdoor"];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Room list */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <LayoutDashboard className="h-5 w-5 text-accent" /> Space Program
            </CardTitle>
            <CardDescription>Add rooms and adjust sizes — gross area includes walls & circulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Target Gross Floor Area</Label>
                <Badge variant="outline">{targetSqft} ft² ({(targetSqft * 0.0929).toFixed(0)} m²)</Badge>
              </div>
              <Slider min={300} max={5000} step={50} value={[targetSqft]} onValueChange={v => setTargetSqft(v[0])} />
              <p className="text-[11px] text-muted-foreground">Tiny home ≈ 400 · Cabin ≈ 800 · Family home ≈ 2000 · Large home ≈ 3500</p>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-4">
              {categories.map(cat => {
                const catRooms = byCategory(cat);
                if (cat !== "living" && catRooms.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{CATEGORY_LABELS[cat]}</p>
                    <div className="space-y-2">
                      {catRooms.map(room => (
                        <div key={room.id} className="group flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{room.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="range"
                                min={20}
                                max={1000}
                                step={5}
                                value={room.areaSqft}
                                onChange={e => updateArea(room.id, Number(e.target.value))}
                                className="w-full h-1.5 accent-primary cursor-pointer"
                              />
                              <span className="text-xs font-mono font-semibold shrink-0 w-16 text-right">{room.areaSqft} ft²</span>
                            </div>
                          </div>
                          <button onClick={() => removeRoom(room.id)} className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add room */}
            <div className="border-t border-border/40 pt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add a Room</p>
              <div className="flex gap-2">
                <Input placeholder="Room name…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addRoom()} className="text-sm bg-background/60 flex-1" />
                <Input type="number" value={newArea} onChange={e => setNewArea(Number(e.target.value))} className="text-sm bg-background/60 w-20" min={20} max={2000} />
                <span className="flex items-center text-xs text-muted-foreground">ft²</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setNewCat(cat)} className={cn("text-[10px] px-2 py-1 rounded-md border font-medium transition-colors", newCat === cat ? CATEGORY_COLORS[cat] + " font-bold" : "border-border/50 text-muted-foreground hover:border-primary/40")}>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <Button onClick={addRoom} size="sm" variant="outline" className="gap-1.5 w-full">
                <Plus className="h-4 w-4" /> Add Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card className={cn("border-2", Math.abs(surplusDeficit) < 100 ? "border-green-300 bg-green-50/30" : surplusDeficit > 0 ? "border-blue-300 bg-blue-50/30" : "border-amber-300 bg-amber-50/30")}>
            <CardContent className="p-5 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gross Floor Area</p>
              <p className="text-5xl font-serif font-bold">{gross.toLocaleString()} <span className="text-xl font-normal text-muted-foreground">ft²</span></p>
              <p className="text-sm text-muted-foreground">{grossSqM} m² · includes walls & circulation</p>
              <div className="w-full bg-muted rounded-full h-3 mt-2">
                <div className={cn("h-3 rounded-full transition-all duration-500", surplusDeficit >= 0 ? "bg-green-500" : "bg-amber-500")}
                  style={{ width: `${Math.min(100, (gross / targetSqft) * 100)}%` }} />
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                {surplusDeficit >= 0
                  ? <><TrendingDown className="h-4 w-4 text-green-600" /><span className="text-green-600 font-semibold">{surplusDeficit.toLocaleString()} ft² under budget ✓</span></>
                  : <><TrendingUp className="h-4 w-4 text-amber-600" /><span className="text-amber-600 font-semibold">{Math.abs(surplusDeficit).toLocaleString()} ft² over budget</span></>
                }
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Net Area</p>
                <p className="text-xl font-serif font-bold">{totalNet.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">ft² rooms only</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Efficiency</p>
                <p className={cn("text-xl font-serif font-bold", efficiency > 78 ? "text-green-600" : efficiency > 70 ? "text-amber-600" : "text-red-500")}>{efficiency}%</p>
                <p className="text-[10px] text-muted-foreground">net / gross</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Rooms</p>
                <p className="text-xl font-serif font-bold">{rooms.length}</p>
                <p className="text-[10px] text-muted-foreground">spaces planned</p>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown bar */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Program Breakdown</p>
              {categories.map(cat => {
                const catTotal = byCategory(cat).reduce((s, r) => s + r.areaSqft, 0);
                if (catTotal === 0) return null;
                const pct = totalNet > 0 ? Math.round((catTotal / totalNet) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={cn("font-medium px-1.5 py-0.5 rounded-sm border text-[10px]", CATEGORY_COLORS[cat])}>{CATEGORY_LABELS[cat]}</span>
                      <span className="text-muted-foreground">{catTotal} ft² · {pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
          <p className="text-sm text-muted-foreground">
            Your program nets <span className="font-semibold text-foreground">{totalNet.toLocaleString()} ft² ({(totalNet * 0.0929).toFixed(0)} m²)</span> of habitable space, growing to ~<span className="font-semibold text-foreground">{gross.toLocaleString()} ft²</span> gross (walls + circulation add ~22%).
            {efficiency >= 80 ? " Excellent efficiency — compact, well-connected plan." : efficiency >= 72 ? " Good efficiency — typical for a well-designed home." : " Low efficiency — consider open-plan areas and reducing corridor lengths."}
            {surplusDeficit < -200 ? ` You're ${Math.abs(surplusDeficit)} ft² over your target. Try combining kitchen/dining or reducing bedroom count.` : surplusDeficit > 400 ? " You have significant budget headroom — add outdoor living, a workshop, or a guest room." : " Your program is well matched to your target size."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
