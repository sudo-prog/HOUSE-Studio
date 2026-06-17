import { useGetFeaturedMaterials } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MaterialsWidget() {
  const { data: materials, isLoading } = useGetFeaturedMaterials();

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-muted-foreground">Featured picks</p>
        <Link href="/materials">
          <span className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
            Library <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
          : materials?.slice(0, 6).map(m => (
              <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40 bg-card/60 hover:border-primary/30 hover:bg-card/90 transition-all">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.category ?? "Material"}</p>
                </div>
                <div className="shrink-0 text-right">
                  {m.embodiedCarbon != null && (
                    <Badge className={cn("text-[9px] px-1.5 py-0", (m.embodiedCarbon ?? 0) < 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                      {(m.embodiedCarbon ?? 0) < 0 ? "−" : "+"}{Math.abs(m.embodiedCarbon ?? 0)}
                    </Badge>
                  )}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
