import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIDrawer } from "@/components/chat/AIDrawer";

const QUICK_PROMPTS = [
  "Best materials for a hot, dry climate?",
  "How to size a rainwater tank for 4 people?",
  "Explain passive solar design basics",
  "What's the carbon footprint of rammed earth?",
];

export default function AIWidget() {
  const [query, setQuery] = useState("");
  const { open, openWithMessage } = useAIDrawer();

  const handleSend = (msg?: string) => {
    const text = (msg ?? query).trim();
    if (text) {
      openWithMessage(text);
    } else {
      open();
    }
    setQuery("");
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 grid grid-cols-2 gap-2">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="text-left p-2.5 rounded-xl border border-border/40 bg-card/60 hover:border-accent/40 hover:bg-accent/5 transition-all text-[10px] text-muted-foreground hover:text-foreground leading-snug flex items-start gap-1.5"
          >
            <Zap className="h-3 w-3 text-accent shrink-0 mt-0.5" />
            {p}
          </button>
        ))}
      </div>

      <div className="flex gap-2 shrink-0">
        <Input
          placeholder="Ask about your habitat…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          className="text-xs h-9 bg-background/60"
        />
        <Button
          size="sm"
          onClick={() => handleSend()}
          className="h-9 bg-accent text-accent-foreground hover:bg-accent/90 px-3 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
