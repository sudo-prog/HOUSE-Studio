import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, Recycle, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

const DIET_TYPES = [
  { id: "vegan", label: "🌱 Vegan", calFromPlants: 1.0, proteinShift: 1.4 },
  { id: "vegetarian", label: "🥚 Vegetarian", calFromPlants: 0.9, proteinShift: 1.2 },
  { id: "omnivore", label: "🍖 Omnivore (avg)", calFromPlants: 0.6, proteinShift: 1.0 },
  { id: "keto", label: "🥩 Meat-heavy", calFromPlants: 0.3, proteinShift: 0.7 },
];

const GARDEN_STYLES = [
  { id: "intensive", label: "Intensive / Raised Beds", yieldPerBedPerWeek: 8, waterPerBedSqftPerWeek: 0.62, bedSqft: 32 },
  { id: "traditional", label: "Traditional Row Planting", yieldPerBedPerWeek: 5, waterPerBedSqftPerWeek: 0.80, bedSqft: 80 },
  { id: "forest", label: "Food Forest / Permaculture", yieldPerBedPerWeek: 6, waterPerBedSqftPerWeek: 0.40, bedSqft: 200 },
  { id: "container", label: "Container / Rooftop", yieldPerBedPerWeek: 4, waterPerBedSqftPerWeek: 0.90, bedSqft: 16 },
];

function gardenCalc(people: number, diet: typeof DIET_TYPES[0], style: typeof GARDEN_STYLES[0], season: number, selfSufficiency: number) {
  // Calories from plants per person per year
  const calPerPersonPerDay = 2200;
  const calFromPlants = calPerPersonPerDay * diet.calFromPlants * (selfSufficiency / 100);
  const totalCalPerYear = calFromPlants * people * 365;

  // 1 lb vegetables / fruit ≈ 150 cal average; intensive bed yields ~8 lb/week active season
  const lbNeededPerYear = totalCalPerYear / 150;
  const lbPerBedPerYear = style.yieldPerBedPerWeek * season;
  const bedsNeeded = Math.ceil(lbNeededPerYear / lbPerBedPerYear);

  // Total garden area
  const totalSqft = bedsNeeded * style.bedSqft;
  const totalM2 = (totalSqft * 0.0929).toFixed(0);

  // Water (gallons/week during season)
  const waterGalPerWeek = Math.round(bedsNeeded * style.bedSqft * style.waterPerBedSqftPerWeek);
  const waterGalPerSeason = waterGalPerWeek * season;
  const waterLitersPerWeek = Math.round(waterGalPerWeek * 3.785);

  // Compost — roughly 1 lb compost per 2 lb of yield
  const compostLbPerYear = lbNeededPerYear * 0.5;
  const compostCubicFt = Math.ceil(compostLbPerYear / 30); // ~30 lb per cu ft finished
  const compostBins = Math.ceil(compostCubicFt / 27); // 1 m³ = ~35 cu ft standard bin

  // Annual yield estimate
  const yieldLbPerYear = Math.round(lbPerBedPerYear * bedsNeeded);
  const yieldKgPerYear = Math.round(yieldLbPerYear * 0.453);

  return {
    bedsNeeded,
    totalSqft: Math.round(totalSqft),
    totalM2,
    waterGalPerWeek,
    waterLitersPerWeek,
    waterGalPerSeason: Math.round(waterGalPerSeason),
    compostCubicFt,
    compostBins,
    yieldLbPerYear,
    yieldKgPerYear,
    lbNeededPerYear: Math.round(lbNeededPerYear),
  };
}

const CROP_IDEAS = [
  { name: "Tomatoes", sqftPer: 4, yieldLb: 20, emoji: "🍅" },
  { name: "Lettuce", sqftPer: 1, yieldLb: 0.5, emoji: "🥬" },
  { name: "Zucchini", sqftPer: 4, yieldLb: 15, emoji: "🥒" },
  { name: "Beans", sqftPer: 1, yieldLb: 0.5, emoji: "🫘" },
  { name: "Kale", sqftPer: 2, yieldLb: 1, emoji: "🥦" },
  { name: "Potatoes", sqftPer: 2, yieldLb: 4, emoji: "🥔" },
  { name: "Herbs", sqftPer: 1, yieldLb: 0.3, emoji: "🌿" },
  { name: "Berries", sqftPer: 4, yieldLb: 5, emoji: "🍓" },
];

export default function FoodGardenPlanner() {
  const [people, setPeople] = useState(2);
  const [season, setSeason] = useState(24); // weeks of growing season
  const [selfSufficiency, setSelfSufficiency] = useState(50); // percent from garden
  const [dietIdx, setDietIdx] = useState(2);
  const [styleIdx, setStyleIdx] = useState(0);

  const r = useMemo(() => gardenCalc(people, DIET_TYPES[dietIdx], GARDEN_STYLES[styleIdx], season, selfSufficiency), [people, season, selfSufficiency, dietIdx, styleIdx]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Leaf className="h-5 w-5 text-accent" /> Garden Inputs
            </CardTitle>
            <CardDescription>Plan a productive food garden tailored to your household</CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Number of People to Feed</Label>
                <Badge variant="outline">{people} {people === 1 ? "person" : "people"}</Badge>
              </div>
              <Slider min={1} max={12} step={1} value={[people]} onValueChange={v => setPeople(v[0])} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Growing Season Length</Label>
                <Badge variant="outline">{season} weeks</Badge>
              </div>
              <Slider min={8} max={52} step={1} value={[season]} onValueChange={v => setSeason(v[0])} />
              <p className="text-[11px] text-muted-foreground">Tropics=52 · Mediterranean=36 · Temperate=24 · Cold climate=16</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Food Self-Sufficiency Goal</Label>
                <Badge variant="outline">{selfSufficiency}% from garden</Badge>
              </div>
              <Slider min={10} max={100} step={5} value={[selfSufficiency]} onValueChange={v => setSelfSufficiency(v[0])} />
              <p className="text-[11px] text-muted-foreground">25% = supplement meals · 50% = half your diet · 100% = full self-sufficiency</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Diet Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {DIET_TYPES.map((d, i) => (
                  <button key={d.id} onClick={() => setDietIdx(i)} className={cn("text-xs px-3 py-2.5 rounded-lg border transition-colors text-left", dietIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Garden Style</Label>
              <div className="grid grid-cols-1 gap-1.5">
                {GARDEN_STYLES.map((g, i) => (
                  <button key={g.id} onClick={() => setStyleIdx(i)} className={cn("text-xs px-3 py-2.5 rounded-lg border transition-colors text-left flex items-center justify-between", styleIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40 hover:bg-muted/50")}>
                    <span>{g.label}</span>
                    <span className="opacity-60 text-[10px]">{g.bedSqft} ft²/bed</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-green-300 bg-green-50/30">
            <CardContent className="p-5 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Garden Beds Needed</p>
              <p className="text-5xl font-serif font-bold text-green-700">{r.bedsNeeded}</p>
              <p className="text-sm text-muted-foreground">beds · {r.totalSqft.toLocaleString()} ft² ({r.totalM2} m²) total</p>
              <p className="text-[11px] text-muted-foreground">Estimated yield: {r.yieldLbPerYear.toLocaleString()} lb ({r.yieldKgPerYear.toLocaleString()} kg) per year</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="border-blue-200 bg-blue-50/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Water / Week</p>
                </div>
                <p className="text-xl font-serif font-bold">{r.waterGalPerWeek}</p>
                <p className="text-[10px] text-muted-foreground">gal ({r.waterLitersPerWeek} L)</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Recycle className="h-3.5 w-3.5 text-amber-600" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Compost</p>
                </div>
                <p className="text-xl font-serif font-bold">{r.compostCubicFt}</p>
                <p className="text-[10px] text-muted-foreground">ft³ · {r.compostBins} bin{r.compostBins !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Apple className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Season H₂O</p>
                </div>
                <p className="text-xl font-serif font-bold">{(r.waterGalPerSeason / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground">gal total season</p>
              </CardContent>
            </Card>
          </div>

          {/* Crop ideas */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested High-Yield Crops</p>
              <div className="grid grid-cols-2 gap-2">
                {CROP_IDEAS.map(crop => (
                  <div key={crop.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/20">
                    <span className="text-lg">{crop.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold">{crop.name}</p>
                      <p className="text-[10px] text-muted-foreground">{crop.yieldLb} lb/{crop.sqftPer} ft²</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-primary mb-1">Architect's Note</p>
          <p className="text-sm text-muted-foreground">
            To grow <span className="font-semibold text-foreground">{selfSufficiency}% of your food</span> for {people} {people === 1 ? "person" : "people"} on a {DIET_TYPES[dietIdx].label.toLowerCase()} diet over a {season}-week season using {GARDEN_STYLES[styleIdx].label.toLowerCase()}, you need <span className="font-semibold text-foreground">{r.bedsNeeded} beds ({r.totalSqft.toLocaleString()} ft² / {r.totalM2} m²)</span>.
            {" "}Weekly water demand of {r.waterGalPerWeek} gal ({r.waterLitersPerWeek} L) is best met with rainwater from a {Math.ceil(r.waterGalPerSeason / 1000)}k-gal cistern.
            {r.compostBins >= 2 ? ` Run ${r.compostBins} compost bins in rotation — hot compost (55–65°C) matures in 6–8 weeks to feed the beds continuously.` : " A single compost bin will supply all your soil amendments."}
            {selfSufficiency === 100 ? " Full self-sufficiency is achievable but requires year-round planning, root cellaring, and preservation (canning, fermentation)." : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
