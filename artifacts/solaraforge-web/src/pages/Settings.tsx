import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings2, Moon, Sun, Monitor, Bell, Download, Trash2, Globe, Leaf, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("sf-theme") as Theme) ?? "system";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("sf-theme", t);
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  };

  return { theme, setTheme };
}

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { id: "light", label: "Light", icon: Sun, desc: "Parchment & forest green — the solarpunk palette" },
  { id: "dark", label: "Dark", icon: Moon, desc: "Deep forest — easier on the eyes at night" },
  { id: "system", label: "System", icon: Monitor, desc: "Follow your OS setting automatically" },
];

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(() => localStorage.getItem("sf-notif") !== "false");
  const [units, setUnits] = useState<"metric" | "imperial">(() =>
    (localStorage.getItem("sf-units") as "metric" | "imperial") ?? "metric"
  );
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("sf-autosave") !== "false");
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem("sf-notif", String(notifications));
    localStorage.setItem("sf-units", units);
    localStorage.setItem("sf-autosave", String(autoSave));
    setSaved(true);
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
    setTimeout(() => setSaved(false), 2000);
  };

  const clearLocalData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("checklist-") || k.startsWith("sf-"));
    keys.forEach(k => localStorage.removeItem(k));
    toast({ title: "Local data cleared", description: "Project checklists and preferences have been reset." });
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8 max-w-2xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-4xl font-bold">Settings</h1>
          <Settings2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Configure your SolaraForge experience. All settings are stored locally.</p>
      </div>

      {/* Appearance */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Sun className="h-4 w-4 text-accent" /> Appearance
          </CardTitle>
          <CardDescription>Choose your visual theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "text-left p-4 rounded-xl border-2 transition-all space-y-2",
                  theme === opt.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                    : "border-border/40 hover:border-primary/30"
                )}
              >
                <opt.icon className={cn("h-5 w-5", theme === opt.id ? "text-primary" : "text-muted-foreground")} />
                <p className="text-sm font-bold">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">{opt.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Units & Measurement
          </CardTitle>
          <CardDescription>Used in all calculators and estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(["metric", "imperial"] as const).map(u => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  units === u ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/30"
                )}
              >
                <p className="text-sm font-bold capitalize">{u}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {u === "metric" ? "m², kg, kWh, L, mm" : "ft², lb, kWh, gal, in"}
                </p>
              </button>
            ))}
          </div>
          {units === "imperial" && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
              Note: Calculator inputs accept imperial but display dual units. Full imperial UI coming soon.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            {
              id: "notifications",
              label: "Phase change notifications",
              description: "Show toast when you advance a project phase",
              value: notifications,
              setValue: setNotifications,
            },
            {
              id: "autosave",
              label: "Auto-save checklist progress",
              description: "Checklist items are saved immediately to local storage",
              value: autoSave,
              setValue: setAutoSave,
            },
          ].map(pref => (
            <div key={pref.id} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={pref.id} className="text-sm font-semibold">{pref.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
              </div>
              <Switch
                id={pref.id}
                checked={pref.value}
                onCheckedChange={pref.setValue}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" /> Data & Privacy
          </CardTitle>
          <CardDescription>All project data is stored in your SolaraForge database. Checklist progress is stored locally in your browser only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-200/50 rounded-xl">
            <Leaf className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">No tracking. No ads. No commercial data sharing.</p>
              <p className="text-xs text-muted-foreground mt-0.5">SolaraForge is committed to open, privacy-respecting tools. Your design data is yours.</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Clear local checklist data</p>
              <p className="text-xs text-muted-foreground">Removes all locally-stored checklist progress. Project data in database is unaffected.</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearLocalData} className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Clear material favourites</p>
              <p className="text-xs text-muted-foreground">Removes all starred materials from your local favourites list.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("sf-material-favorites");
                toast({ title: "Favourites cleared", description: "All starred materials have been removed." });
              }}
              className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Clear SolaraSpec history</p>
              <p className="text-xs text-muted-foreground">Removes all saved SolaraSpec generations from the Studio history panel.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("sf-solaraspec-history");
                toast({ title: "History cleared", description: "SolaraSpec history has been removed." });
              }}
              className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={save}
          className={cn(
            "gap-2 px-8 rounded-full transition-all",
            saved ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary text-primary-foreground"
          )}
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
