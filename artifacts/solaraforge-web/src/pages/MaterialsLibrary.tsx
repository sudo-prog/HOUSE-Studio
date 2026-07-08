import { useListMaterials } from "@workspace/api-client-react";
import { MaterialCard, MaterialSkeleton, getFavorites, toggleFavorite } from "@/components/materials/MaterialCard";
import { MaterialCompareDrawer } from "@/components/materials/MaterialCompareDrawer";
import { useState, useMemo, useCallback } from "react";
import { Database, Search, Leaf, ArrowUpDown, GitCompareArrows, X, Star, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { asArray } from "@/lib/safe";
import type { Material } from "@workspace/api-client-react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RV_KEY = "sf-recently-viewed-materials";
function getRecentlyViewed(): number[] {
  try { return JSON.parse(localStorage.getItem(RV_KEY) ?? "[]"); } catch { return []; }
}
function trackRecentlyViewed(id: number): void {
  try {
    const prev = getRecentlyViewed();
    const next = [id, ...prev.filter(x => x !== id)].slice(0, 6);
    localStorage.setItem(RV_KEY, JSON.stringify(next));
  } catch {}
}

const CATEGORIES = ["All", "Wall Systems", "Structure", "Insulation", "Finishes", "Flooring", "Roofing"];

type SortKey = "default" | "carbon-asc" | "carbon-desc" | "durability" | "recyclability" | "name";

const SORT_LABELS: Record<SortKey, string> = {
  "default": "Default",
  "carbon-asc": "Carbon: Lowest first",
  "carbon-desc": "Carbon: Highest first",
  "durability": "Durability (years)",
  "recyclability": "Recyclability %",
  "name": "Name A–Z",
};

export default function MaterialsLibrary() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [onlyNegative, setOnlyNegative] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => getFavorites());
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>(() => getRecentlyViewed());

  const handleMaterialView = useCallback((id: number) => {
    trackRecentlyViewed(id);
    setRecentlyViewedIds(getRecentlyViewed());
  }, []);

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds(toggleFavorite(id));
  };

  const toggleCompare = (id: number) => {
    setCompareIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 4 ? prev : [...prev, id]
    );
  };

  const { data: materialsRaw, isLoading } = useListMaterials({
    category: category === "All" ? undefined : category,
  });

  const filteredMaterials = useMemo(() => {
    let list = asArray<Material>(materialsRaw);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (onlyNegative) {
      list = list.filter(m => m.embodiedCarbon < 0);
    }

    if (onlyFavorites) {
      list = list.filter(m => favoriteIds.includes(m.id));
    }

    switch (sort) {
      case "carbon-asc":
        list = [...list].sort((a, b) => a.embodiedCarbon - b.embodiedCarbon);
        break;
      case "carbon-desc":
        list = [...list].sort((a, b) => b.embodiedCarbon - a.embodiedCarbon);
        break;
      case "durability":
        list = [...list].sort((a, b) => b.durabilityYears - a.durabilityYears);
        break;
      case "recyclability":
        list = [...list].sort((a, b) => b.recyclability - a.recyclability);
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [materialsRaw, search, onlyNegative, onlyFavorites, favoriteIds, sort]);

  const negativeCount = asArray<Material>(materialsRaw).filter(m => m.embodiedCarbon < 0).length;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Recently Viewed strip */}
      {recentlyViewedIds.length > 0 && materialsRaw && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Recently Viewed
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentlyViewedIds
              .map(id => asArray<Material>(materialsRaw).find(m => m.id === id))
              .filter(Boolean)
              .map(m => m!)
              .map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    document.getElementById(`material-${m.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/30 transition-all text-xs"
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    m.embodiedCarbon < 0 ? "bg-green-400" : "bg-amber-400"
                  )} />
                  <span className="font-medium text-foreground truncate max-w-[120px]">{m.name}</span>
                  <span className="text-muted-foreground/70">{m.category}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Materials Library</h1>
          <p className="text-muted-foreground mt-1">
            Sustainably sourced, carbon-negative building blocks.
            {materialsRaw && (
              <span className="ml-2 text-xs text-green-700 font-semibold">
                {negativeCount} carbon-negative of {asArray<Material>(materialsRaw).length}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Favourites toggle */}
          <button
            onClick={() => setOnlyFavorites(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
              onlyFavorites
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-card/50 border-border/50 text-muted-foreground hover:border-amber-300 hover:text-amber-600"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", onlyFavorites ? "fill-amber-500 text-amber-500" : "")} />
            Favourites
            {favoriteIds.length > 0 && <span className="ml-0.5 bg-amber-200 text-amber-800 rounded-full text-[9px] px-1.5 py-0">{favoriteIds.length}</span>}
          </button>

          {/* Carbon negative toggle */}
          <button
            onClick={() => setOnlyNegative(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
              onlyNegative
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-card/50 border-border/50 text-muted-foreground hover:border-green-300 hover:text-green-700"
            )}
          >
            <Leaf className={cn("h-3.5 w-3.5", onlyNegative && "text-green-600")} />
            Carbon Negative Only
          </button>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sort === "default" ? "Sort" : SORT_LABELS[sort]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSort(key)}
                  className={cn("cursor-pointer text-xs", sort === key && "font-semibold text-primary")}
                >
                  {SORT_LABELS[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              className="pl-9 bg-card/50 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active filters */}
      {(onlyFavorites || onlyNegative || sort !== "default" || search) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {onlyFavorites && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 gap-1 cursor-pointer" onClick={() => setOnlyFavorites(false)}>
              <Star className="h-2.5 w-2.5 fill-amber-500" /> Favourites Only ×
            </Badge>
          )}
          {onlyNegative && (
            <Badge variant="outline" className="text-xs border-green-300 text-green-700 gap-1 cursor-pointer" onClick={() => setOnlyNegative(false)}>
              <Leaf className="h-2.5 w-2.5" /> Carbon Negative Only ×
            </Badge>
          )}
          {sort !== "default" && (
            <Badge variant="outline" className="text-xs gap-1 cursor-pointer" onClick={() => setSort("default")}>
              <ArrowUpDown className="h-2.5 w-2.5" /> {SORT_LABELS[sort]} ×
            </Badge>
          )}
          {search && (
            <Badge variant="outline" className="text-xs gap-1 cursor-pointer" onClick={() => setSearch("")}>
              <Search className="h-2.5 w-2.5" /> "{search}" ×
            </Badge>
          )}
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            onClick={() => { setOnlyFavorites(false); setOnlyNegative(false); setSort("default"); setSearch(""); }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "s" : ""}
          {category !== "All" && ` in ${category}`}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <MaterialSkeleton key={i} />)}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Database className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif">No materials found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => { setSearch(""); setOnlyNegative(false); setSort("default"); setCategory("All"); }}
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map(material => (
            <div key={material.id} id={`material-${material.id}`} onClick={() => handleMaterialView(material.id)}>
              <MaterialCard
                material={material}
                isComparing={compareIds.includes(material.id)}
                onToggleCompare={toggleCompare}
                isFavorited={favoriteIds.includes(material.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sticky compare bar */}
      {compareIds.length >= 1 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 bg-card/95 backdrop-blur border border-border/60 rounded-2xl shadow-2xl">
          <GitCompareArrows className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm font-semibold">
            {compareIds.length} selected
          </span>
          <div className="flex gap-1">
            {compareIds.map(id => {
              const m = asArray<Material>(materialsRaw).find(x => x.id === id);
              return m ? (
                <Badge key={id} variant="outline" className="text-[10px] gap-1 pr-1">
                  {m.name}
                  <button onClick={() => toggleCompare(id)} className="hover:text-destructive">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
          <Button
            size="sm"
            disabled={compareIds.length < 2}
            onClick={() => setCompareOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 text-xs gap-1"
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            Compare {compareIds.length >= 2 ? `(${compareIds.length})` : ""}
          </Button>
          <button
            onClick={() => setCompareIds([])}
            className="text-muted-foreground hover:text-foreground"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Compare drawer */}
      <MaterialCompareDrawer
        materials={asArray<Material>(materialsRaw).filter(m => compareIds.includes(m.id))}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemove={id => {
          setCompareIds(prev => prev.filter(x => x !== id));
          if (compareIds.length <= 2) setCompareOpen(false);
        }}
      />
    </div>
  );
}
