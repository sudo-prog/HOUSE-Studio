import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useListProjects, useListMaterials } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Search, TreePine, Database, Wrench, Wand2, Home, Info, Sun, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const STATIC_PAGES = [
  { label: "Dashboard", href: "/", icon: Home, description: "Home overview" },
  { label: "Projects", href: "/projects", icon: TreePine, description: "All habitat projects" },
  { label: "Design Toolkit", href: "/tools", icon: Wrench, description: "5 professional calculators" },
  { label: "Materials Library", href: "/materials", icon: Database, description: "Sustainable building materials" },
  { label: "Moodboard Studio", href: "/studio", icon: Wand2, description: "AI moodboard analyser" },
  { label: "Community Showcase", href: "/showcase", icon: Globe, description: "Public projects gallery" },
  { label: "About", href: "/about", icon: Info, description: "Our manifesto" },
  { label: "Solar Designer Tool", href: "/tools", icon: Sun, description: "Panel count & annual yield" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data: projects } = useListProjects();
  const { data: materials } = useListMaterials({});

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return STATIC_PAGES.map(p => ({ ...p, type: "page" as const }));

    const pageResults = STATIC_PAGES
      .filter(p => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .map(p => ({ ...p, type: "page" as const }));

    const projectResults = (projects ?? [])
      .filter(p => p.name.toLowerCase().includes(q) || p.biome?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({
        label: p.name,
        href: `/projects/${p.id}`,
        icon: TreePine,
        description: `${p.biome ?? "Unknown biome"} · ${p.phase ?? "concept"}`,
        type: "project" as const,
      }));

    const materialResults = (materials ?? [])
      .filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)))
      .slice(0, 4)
      .map(m => ({
        label: m.name,
        href: `/materials`,
        icon: Database,
        description: `${m.category} · ${m.embodiedCarbon < 0 ? "Carbon negative" : m.embodiedCarbon + " kg CO₂/m²"}`,
        type: "material" as const,
      }));

    return [...pageResults, ...projectResults, ...materialResults].slice(0, 10);
  }, [query, projects, materials]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [results.length, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  const handleSelect = (href: string) => {
    navigate(href);
    onOpenChange(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      handleSelect(results[selectedIdx].href);
    }
  };

  const typeLabel = (type: string) => {
    if (type === "project") return { label: "Project", className: "bg-primary/10 text-primary" };
    if (type === "material") return { label: "Material", className: "bg-green-100 text-green-700 dark:bg-green-900/30" };
    return { label: "Page", className: "bg-muted text-muted-foreground" };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQuery(""); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-xl shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            placeholder="Search projects, materials, pages…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-base p-0 h-auto"
          />
          <kbd className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground font-mono shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
          ) : (
            <div className="p-2 space-y-0.5">
              {results.map((result, i) => (
                <button
                  key={`${result.href}-${result.label}-${i}`}
                  onClick={() => handleSelect(result.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    i === selectedIdx ? "bg-primary text-primary-foreground" : "hover:bg-muted/60"
                  )}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <result.icon className={cn("h-4 w-4 shrink-0", i === selectedIdx ? "text-primary-foreground/80" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", i === selectedIdx ? "text-primary-foreground" : "text-foreground")}>{result.label}</p>
                    <p className={cn("text-[11px] truncate", i === selectedIdx ? "text-primary-foreground/70" : "text-muted-foreground")}>{result.description}</p>
                  </div>
                  <Badge className={cn("text-[9px] px-1.5 shrink-0", i === selectedIdx ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : typeLabel(result.type).className)}>
                    {typeLabel(result.type).label}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border/30 bg-muted/30 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="font-mono bg-background border border-border rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-background border border-border rounded px-1">↵</kbd> open</span>
          <span><kbd className="font-mono bg-background border border-border rounded px-1">esc</kbd> close</span>
          <span className="ml-auto">⌘K to open anywhere</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
