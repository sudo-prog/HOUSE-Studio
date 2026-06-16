import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2, TrendingUp, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineItem {
  id: string; category: string; label: string; estimated: number; actual: number | null;
}

const CATEGORIES = [
  { id: "land", label: "Land & Site", color: "bg-amber-400" },
  { id: "design", label: "Design & Permits", color: "bg-blue-400" },
  { id: "structure", label: "Structure & Shell", color: "bg-green-500" },
  { id: "mep", label: "M&E (Solar/Water/Sewage)", color: "bg-cyan-400" },
  { id: "finishes", label: "Finishes & Fitout", color: "bg-orange-400" },
  { id: "contingency", label: "Contingency", color: "bg-red-400" },
  { id: "other", label: "Other", color: "bg-gray-400" },
];

const STARTER_ITEMS: LineItem[] = [
  { id: "1", category: "land", label: "Land purchase", estimated: 50000, actual: null },
  { id: "2", category: "land", label: "Site clearing & earthworks", estimated: 8000, actual: null },
  { id: "3", category: "design", label: "Architect / designer fees", estimated: 12000, actual: null },
  { id: "4", category: "design", label: "Building permits & compliance", estimated: 3500, actual: null },
  { id: "5", category: "structure", label: "Foundation / slab", estimated: 15000, actual: null },
  { id: "6", category: "structure", label: "Wall system (hempcrete / CLT)", estimated: 28000, actual: null },
  { id: "7", category: "structure", label: "Roof structure", estimated: 18000, actual: null },
  { id: "8", category: "structure", label: "Windows & doors (triple-glazed)", estimated: 14000, actual: null },
  { id: "9", category: "mep", label: "Solar PV array + battery", estimated: 22000, actual: null },
  { id: "10", category: "mep", label: "Rainwater system + tank", estimated: 6500, actual: null },
  { id: "11", category: "mep", label: "Composting / greywater treatment", estimated: 4000, actual: null },
  { id: "12", category: "mep", label: "HRV ventilation", estimated: 4500, actual: null },
  { id: "13", category: "finishes", label: "Kitchen & bathroom fitout", estimated: 18000, actual: null },
  { id: "14", category: "finishes", label: "Lime plaster & flooring", estimated: 9000, actual: null },
  { id: "15", category: "contingency", label: "Contingency (15%)", estimated: 0, actual: null },
];

export default function BudgetPlanner() {
  const [items, setItems] = useState<LineItem[]>(() =>
    STARTER_ITEMS.map(item => item.id === "15"
      ? { ...item, estimated: Math.round(STARTER_ITEMS.slice(0, -1).reduce((a, b) => a + b.estimated, 0) * 0.15) }
      : item
  ));
  const [newLabel, setNewLabel] = useState("");
  const [newCat, setNewCat] = useState("other");
  const [newAmount, setNewAmount] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const totals = useMemo(() => {
    const estimated = items.reduce((a, i) => a + i.estimated, 0);
    const actual = items.filter(i => i.actual !== null).reduce((a, i) => a + (i.actual ?? 0), 0);
    const itemsWithActual = items.filter(i => i.actual !== null).length;
    const variance = actual - items.filter(i => i.actual !== null).reduce((a, i) => a + i.estimated, 0);
    const byCategory = CATEGORIES.map(cat => ({
      ...cat,
      total: items.filter(i => i.category === cat.id).reduce((a, i) => a + i.estimated, 0),
      pct: estimated > 0 ? Math.round(items.filter(i => i.category === cat.id).reduce((a, i) => a + i.estimated, 0) / estimated * 100) : 0,
    }));
    return { estimated, actual, itemsWithActual, variance, byCategory };
  }, [items]);

  const addItem = () => {
    if (!newLabel.trim() || !newAmount) return;
    const id = Date.now().toString();
    setItems(prev => [...prev, { id, category: newCat, label: newLabel.trim(), estimated: parseFloat(newAmount) || 0, actual: null }]);
    setNewLabel(""); setNewAmount("");
  };

  const updateActual = (id: string, val: string) => {
    const num = parseFloat(val);
    setItems(prev => prev.map(i => i.id === id ? { ...i, actual: isNaN(num) || val === "" ? null : num } : i));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const filtered = activeFilter ? items.filter(i => i.category === activeFilter) : items;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Budget</p>
            <p className="text-2xl font-serif font-bold text-accent">${totals.estimated.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Spent So Far</p>
            <p className="text-2xl font-serif font-bold">${totals.actual.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={cn("border", totals.variance <= 0 ? "border-green-200/50 bg-green-50/20" : "border-red-200/50 bg-red-50/20")}>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Variance</p>
            <p className={cn("text-2xl font-serif font-bold", totals.variance <= 0 ? "text-green-700" : "text-red-600")}>
              {totals.variance > 0 ? "+" : ""}${totals.variance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Items Tracked</p>
            <p className="text-2xl font-serif font-bold">{totals.itemsWithActual} / {items.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown bar */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <PieChart className="h-4 w-4 text-accent" /> Budget Breakdown
          </CardTitle>
          <CardDescription>Click a category to filter the list below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex rounded-full overflow-hidden h-6 w-full">
            {totals.byCategory.filter(c => c.pct > 0).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
                style={{ width: `${cat.pct}%` }}
                className={cn("h-full transition-opacity", cat.color, activeFilter && activeFilter !== cat.id ? "opacity-30" : "opacity-100")}
                title={`${cat.label}: ${cat.pct}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {totals.byCategory.filter(c => c.total > 0).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  activeFilter === cat.id ? "bg-foreground text-background border-foreground" : "border-border/40 hover:border-foreground/40")}
              >
                <div className={cn("w-2 h-2 rounded-full shrink-0", cat.color)} />
                {cat.label}
                <span className="opacity-60">{cat.pct}% · ${cat.total.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Line Items
              {activeFilter && <Badge variant="secondary" className="text-xs ml-1">{CATEGORIES.find(c => c.id === activeFilter)?.label}</Badge>}
            </CardTitle>
            <CardDescription className="mt-1">Enter actual costs as you spend to track variance</CardDescription>
          </div>
          {activeFilter && (
            <Button variant="ghost" size="sm" onClick={() => setActiveFilter(null)} className="text-xs">Clear filter</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-2 text-[10px] text-muted-foreground uppercase font-semibold">
            <div className="col-span-5">Item</div>
            <div className="col-span-3 text-right">Budget</div>
            <div className="col-span-3 text-right">Actual</div>
            <div className="col-span-1" />
          </div>

          {filtered.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category);
            const over = item.actual !== null && item.actual > item.estimated;
            return (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/30 group">
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", cat?.color)} />
                  <span className="text-sm truncate">{item.label}</span>
                </div>
                <div className="col-span-3 text-right">
                  <Input
                    type="number"
                    value={item.estimated}
                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, estimated: parseFloat(e.target.value) || 0 } : i))}
                    className="h-7 text-right text-sm bg-transparent border-border/30 focus:border-primary"
                  />
                </div>
                <div className="col-span-3 text-right">
                  <Input
                    type="number"
                    placeholder="—"
                    value={item.actual ?? ""}
                    onChange={e => updateActual(item.id, e.target.value)}
                    className={cn("h-7 text-right text-sm bg-transparent border-border/30", over ? "border-red-300 text-red-600" : item.actual !== null ? "border-green-300 text-green-700" : "")}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Add new */}
          <div className="grid grid-cols-12 gap-2 items-center px-2 pt-3 border-t border-border/30">
            <div className="col-span-2">
              <select value={newCat} onChange={e => setNewCat(e.target.value)}
                className="w-full text-xs border border-border/40 rounded-md px-1 py-1.5 bg-background">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-span-6">
              <Input placeholder="New line item..." value={newLabel} onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()} className="h-8 text-sm" />
            </div>
            <div className="col-span-3">
              <Input type="number" placeholder="$0" value={newAmount} onChange={e => setNewAmount(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()} className="h-8 text-sm text-right" />
            </div>
            <div className="col-span-1">
              <Button size="icon" onClick={addItem} className="h-8 w-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex gap-2">
          <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            A healthy contingency is <strong>15–20%</strong> for owner-builder projects and <strong>10%</strong> for contractor-managed builds. Natural material builds often save 30–50% on walls vs. conventional construction, but windows, foundations, and M&E costs remain similar. Your total indicative budget of <strong>${totals.estimated.toLocaleString()}</strong> includes all items above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
