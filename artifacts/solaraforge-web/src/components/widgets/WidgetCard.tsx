import { useState } from "react";
import { X, GripVertical, Maximize2, Minimize2, BarChart3, TreePine, Sun, Battery, Leaf, Package, Wrench, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, React.ElementType> = {
  BarChart3, TreePine, Sun, Battery, Leaf, Package, Wrench, Sparkles,
};

interface WidgetCardProps {
  id: string;
  title: string;
  icon: string;
  children: ReactNode;
  onRemove: () => void;
  isEditing: boolean;
  fullContent?: ReactNode;
}

export default function WidgetCard({ id, title, icon, children, onRemove, isEditing, fullContent }: WidgetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[icon] ?? Sparkles;

  return (
    <>
      <div className="h-full flex flex-col rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden group/widget">
        {/* Header — drag handle */}
        <div className={cn(
          "drag-handle flex items-center gap-2 px-3 py-2.5 border-b border-border/40 shrink-0 select-none",
          isEditing ? "cursor-grab active:cursor-grabbing bg-muted/40" : "cursor-default"
        )}>
          {isEditing && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
          <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="text-xs font-semibold text-foreground flex-1 truncate">{title}</span>

          <div className="flex items-center gap-1 opacity-0 group-hover/widget:opacity-100 transition-opacity">
            {fullContent && (
              <button
                onClick={() => setExpanded(true)}
                className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Expand"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            )}
            {isEditing && (
              <button
                onClick={onRemove}
                className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove widget"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 overflow-hidden min-h-0">
          {children}
        </div>
      </div>

      {/* Expanded dialog */}
      {fullContent && (
        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center gap-2">
                <Icon className="h-5 w-5 text-accent" />
                {title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2">{fullContent}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
