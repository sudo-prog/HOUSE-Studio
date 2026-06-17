import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Open keyboard shortcuts" },
      { keys: ["G", "H"], description: "Go to Dashboard" },
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "M"], description: "Go to Materials" },
      { keys: ["G", "T"], description: "Go to Toolkit" },
      { keys: ["G", "S"], description: "Go to Studio" },
      { keys: ["G", "W"], description: "Go to Workflow" },
      { keys: ["G", "C"], description: "Go to Showcase" },
      { keys: ["G", "A"], description: "Go to About" },
    ],
  },
  {
    title: "AI Collaborator",
    shortcuts: [
      { keys: ["⌘", "J"], description: "Open / close AI drawer" },
    ],
  },
  {
    title: "Dashboard",
    shortcuts: [
      { keys: ["E"], description: "Enter customise mode (on Dashboard)" },
      { keys: ["R"], description: "Reset layout (on Dashboard)" },
    ],
  },
  {
    title: "Materials Library",
    shortcuts: [
      { keys: ["★"], description: "Star icon — toggle favourite on a material card" },
      { keys: ["⊕"], description: "Compare icon — add material to comparison" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["ESC"], description: "Close any open panel or dialog" },
      { keys: ["↑", "↓"], description: "Navigate command palette results" },
      { keys: ["↵"], description: "Open selected result" },
      { keys: ["⌘", "↵"], description: "Save note (in Project Journal)" },
    ],
  },
];

export default function KeyboardShortcutsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Keyboard className="h-5 w-5 text-accent" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2 max-h-[60vh] overflow-y-auto pr-1">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{section.title}</p>
              <div className="space-y-2">
                {section.shortcuts.map(s => (
                  <div key={s.description} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-foreground">{s.description}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {s.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="text-[11px] min-w-[24px] h-6 flex items-center justify-center px-1.5 rounded border border-border bg-muted font-mono text-foreground shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/60 pt-2 border-t border-border/40 text-center">
          More shortcuts coming as SolaraForge grows.
        </p>
      </DialogContent>
    </Dialog>
  );
}
