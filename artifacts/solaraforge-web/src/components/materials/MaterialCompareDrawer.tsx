import { Material } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Leaf, TrendingDown, TrendingUp, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  materials: Material[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: number) => void;
}

const ROWS = [
  { label: "Category", key: "category" as keyof Material, render: (v: unknown) => String(v) },
  {
    label: "Embodied Carbon",
    key: "embodiedCarbon" as keyof Material,
    render: (v: unknown) => {
      const n = Number(v);
      return (
        <span className={cn("font-bold", n < 0 ? "text-green-600" : "text-amber-600")}>
          {n} kg CO₂e
        </span>
      );
    },
    best: (vals: unknown[]) => {
      const nums = vals.map(Number);
      return nums.indexOf(Math.min(...nums));
    },
  },
  {
    label: "Durability",
    key: "durabilityYears" as keyof Material,
    render: (v: unknown) => `${v} years`,
    best: (vals: unknown[]) => {
      const nums = vals.map(Number);
      return nums.indexOf(Math.max(...nums));
    },
  },
  {
    label: "Recyclability",
    key: "recyclability" as keyof Material,
    render: (v: unknown) => `${v}%`,
    best: (vals: unknown[]) => {
      const nums = vals.map(Number);
      return nums.indexOf(Math.max(...nums));
    },
  },
  { label: "Availability", key: "localAvailability" as keyof Material, render: (v: unknown) => String(v) },
];

export function MaterialCompareDrawer({ materials, open, onOpenChange, onRemove }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto p-0">
        <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <SheetTitle className="font-serif text-xl">Material Comparison</SheetTitle>
            <Badge variant="outline" className="text-xs">{materials.length} selected</Badge>
          </div>
        </SheetHeader>

        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36 pb-4 pr-4">
                  Property
                </th>
                {materials.map(m => (
                  <th key={m.id} className="pb-4 px-4 text-left min-w-[180px] align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif font-bold text-base text-foreground leading-tight">{m.name}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 mt-1",
                            m.embodiedCarbon < 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {m.embodiedCarbon < 0 ? (
                            <><Leaf className="h-2.5 w-2.5 mr-0.5 inline" /> Carbon Negative</>
                          ) : "Carbon Positive"}
                        </Badge>
                      </div>
                      <button
                        onClick={() => onRemove(m.id)}
                        className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                        title="Remove from comparison"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => {
                const vals = materials.map(m => m[row.key]);
                const bestIdx = "best" in row && row.best ? row.best(vals) : -1;

                return (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-t border-border/40",
                      ri % 2 === 0 ? "bg-muted/20" : ""
                    )}
                  >
                    <td className="py-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide align-top">
                      {row.label}
                    </td>
                    {materials.map((m, mi) => (
                      <td
                        key={m.id}
                        className={cn(
                          "py-3 px-4 align-top",
                          bestIdx === mi && "relative"
                        )}
                      >
                        <div className={cn(
                          "text-sm",
                          bestIdx === mi && "font-bold"
                        )}>
                          {row.render(m[row.key])}
                          {bestIdx === mi && (
                            <span className="ml-1.5 inline-flex items-center text-[9px] text-green-600 font-bold">
                              <TrendingDown className="h-2.5 w-2.5" />
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              {/* Tags row */}
              <tr className="border-t border-border/40">
                <td className="py-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide align-top">Tags</td>
                {materials.map(m => (
                  <td key={m.id} className="py-3 px-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {m.tags.slice(0, 4).map(t => (
                        <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50">{t}</Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Description row */}
              <tr className="border-t border-border/40 bg-muted/20">
                <td className="py-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide align-top">Notes</td>
                {materials.map(m => (
                  <td key={m.id} className="py-3 px-4 align-top">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{m.description}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {materials.length < 2 && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Select at least 2 materials to compare.
            </p>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border/40 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
