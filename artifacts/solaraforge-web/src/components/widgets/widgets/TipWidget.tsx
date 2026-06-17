import { useState } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIPS = [
  { tip: "Orient your longest wall within 15° of true south to maximise passive solar gain in winter.", tag: "Passive Solar" },
  { tip: "A thermal mass wall absorbs heat during the day and releases it at night — rammed earth stores 5× more than timber.", tag: "Thermal Mass" },
  { tip: "Greywater from showers and sinks can irrigate fruit trees directly — no treatment needed for sub-surface drip systems.", tag: "Water" },
  { tip: "A 1m deep earthship berm on the north wall reduces heating demand by up to 40% in cold climates.", tag: "Earthship" },
  { tip: "Hempcrete is carbon-negative: 1m³ sequesters ~110 kg CO₂e over its lifetime while providing R-1.5 per inch.", tag: "Materials" },
  { tip: "Vertical wind turbines perform well in turbulent urban airflow — pair with solar for year-round resilience.", tag: "Energy" },
  { tip: "Compost toilets can reduce household water use by up to 30% and produce rich, pathogen-free soil amendment.", tag: "Sanitation" },
  { tip: "Living roofs add 50–100mm of insulation, extend roof lifespan 2–3× and support urban biodiversity corridors.", tag: "Green Roof" },
  { tip: "A single mature food forest can produce 10× more calories per hectare than a monocrop field.", tag: "Food" },
  { tip: "Straw bale walls have an R-value of ~R-30 and can be load-bearing with the right compression system.", tag: "Straw Bale" },
  { tip: "Bottle walls — glass bottles set in clay mortar — create beautiful, insulating, and zero-waste structures.", tag: "Upcycling" },
  { tip: "Earth plaster is breathable, anti-microbial, and self-repairing — scrape, dampen, and smooth any cracks.", tag: "Finishes" },
  { tip: "A 4kW solar array + 10kWh battery can cover most off-grid household loads in most temperate climates.", tag: "Energy" },
  { tip: "Rainwater harvesting from a 100m² roof yields ~60,000L per year in a 600mm rainfall climate.", tag: "Water" },
  { tip: "CLT (cross-laminated timber) sequesters ~0.9 tonnes CO₂e per m³ and outperforms concrete in fire resistance.", tag: "Structure" },
  { tip: "Earthen floors mixed with linseed oil cure into a durable, waterproof surface with zero VOCs.", tag: "Flooring" },
  { tip: "Swales on contour slow, spread, and sink rainfall — one swale can recharge groundwater for an entire acre.", tag: "Permaculture" },
  { tip: "Polycarbonate glazing on a south-facing greenhouse extends the growing season by 3–4 months in Zone 6.", tag: "Food" },
  { tip: "Triple-glazed windows pay back their embodied carbon in 3–5 years through heating savings.", tag: "Windows" },
  { tip: "Cork harvested from bark regrows every 9 years — it is one of the most sustainable flooring materials on Earth.", tag: "Materials" },
];

function getTodayTip() {
  const day = Math.floor(Date.now() / 86400000);
  return TIPS[day % TIPS.length];
}

export default function TipWidget() {
  const [tip, setTip] = useState(getTodayTip);

  const shuffle = () => {
    const next = TIPS[Math.floor(Math.random() * TIPS.length)];
    setTip(next);
  };

  return (
    <div className="h-full flex flex-col justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Solarpunk Tip</p>
          <p className="text-sm leading-relaxed text-foreground">{tip.tip}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {tip.tag}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={shuffle}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <RefreshCw className="h-3 w-3" /> New tip
        </Button>
      </div>
    </div>
  );
}
