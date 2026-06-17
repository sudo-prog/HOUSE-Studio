import { useState, useEffect, useRef, useCallback } from "react";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey,
  Project,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Leaf, Send, Plus, Copy, Check, Zap, Brain,
  AlertTriangle, MessageCircle, Loader2, Pencil,
  Sparkles, Code2, BookOpen, FlaskConical, RefreshCw,
  ChevronDown, ChevronUp, X, Play,
} from "lucide-react";

function memoryKey(projectId: number) {
  return `ai-memory-${projectId}`;
}

function loadMemory(projectId: number): string {
  return localStorage.getItem(memoryKey(projectId)) ?? "";
}

function saveMemory(projectId: number, value: string) {
  localStorage.setItem(memoryKey(projectId), value);
}

interface TsCheckResult {
  errorCount: number;
  warningCount: number;
  errors: string[];
  clean: boolean;
}

interface CodeBlockProps {
  lang: string;
  code: string;
  onApply?: (filePath: string, code: string) => void;
}

function CodeBlock({ lang, code, onApply }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const firstLine = code.split("\n")[0]?.trim() ?? "";
  const filePathMatch = firstLine.match(/^\/\/\s*filepath:\s*(.+)$/i);
  const filePath = filePathMatch?.[1]?.trim();
  const displayCode = filePath ? code.split("\n").slice(1).join("\n") : code;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!filePath || !onApply) return;
    setApplying(true);
    try {
      await onApply(filePath, displayCode);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-border/40 bg-zinc-950 text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Code2 className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-400 font-mono text-[10px]">{filePath ?? lang}</span>
        </div>
        <div className="flex items-center gap-1">
          {filePath && onApply && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleApply}
              disabled={applying || applied}
              className={cn(
                "h-6 px-2 text-[10px] gap-1",
                applied
                  ? "text-green-400 hover:text-green-400"
                  : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
              )}
            >
              {applying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : applied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {applied ? "Applied!" : applying ? "Applying…" : "Apply"}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 px-2 text-[10px] gap-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed text-zinc-200 max-h-80">
        <code>{displayCode}</code>
      </pre>
    </div>
  );
}

function parseMessageContent(
  content: string,
  onApply?: (fp: string, code: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(<span key={idx++} className="whitespace-pre-wrap">{text}</span>);
    }
    const lang = match[1] || "text";
    const code = match[2].trimEnd();
    parts.push(<CodeBlock key={idx++} lang={lang} code={code} onApply={onApply} />);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(<span key={idx++} className="whitespace-pre-wrap">{content.slice(lastIndex)}</span>);
  }

  return parts;
}

function MemoryPanel({
  projectId,
  memory,
  onUpdate,
}: {
  projectId: number;
  memory: string;
  onUpdate: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(memory);

  const save = () => {
    saveMemory(projectId, draft);
    onUpdate(draft);
    setOpen(false);
  };

  return (
    <div className="border-b border-border/30 bg-primary/5">
      <button
        onClick={() => { setDraft(memory); setOpen(o => !o); }}
        className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-primary font-medium">
          <Brain className="h-3.5 w-3.5" />
          Project Memory
          {memory ? (
            <Badge className="ml-1 h-4 text-[9px] px-1.5 bg-primary/20 text-primary border-0">
              {memory.split("\n").filter(Boolean).length} facts
            </Badge>
          ) : (
            <span className="text-muted-foreground font-normal">(empty)</span>
          )}
        </div>
        {open ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-[10px] text-muted-foreground">
            The AI reads this at the start of every message. Write key facts, decisions, and preferences about this project.
          </p>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={"- Roof must support a green roof system\n- Owner prefers natural plasters\n- Budget ceiling: $120k\n- Site faces SE — optimize for morning sun"}
            className="text-xs font-mono h-28 resize-none bg-background/60"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs bg-primary gap-1" onClick={save}>
              <Brain className="h-3 w-3" /> Save Memory
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TsErrorBanner({
  onFixAll,
}: {
  onFixAll: (errors: string[]) => void;
}) {
  const [result, setResult] = useState<TsCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/tools/ts-check");
      const data: TsCheckResult = await res.json();
      setResult(data);
      setDismissed(false);
    } catch {
      // silently fail — API might not be reachable
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (dismissed || !result || result.clean) return null;

  return (
    <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        {result.errorCount} TypeScript {result.errorCount === 1 ? "error" : "errors"} detected
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFixAll(result.errors)}
          className="h-6 px-2 text-[10px] gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Zap className="h-3 w-3" /> Fix all errors →
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={check}
          disabled={checking}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          title="Re-check"
        >
          <RefreshCw className={cn("h-3 w-3", checking && "animate-spin")} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: "🌿", label: "Analyse sustainability", prompt: (p: Project) => `Analyse the sustainability of my ${p.biome ?? "biome"} habitat "${p.name}". What are the strongest regenerative features and where can I improve embodied carbon, water, and energy?` },
  { icon: "🏗️", label: "Generate a component", prompt: () => "Create a new React component for me. I'll describe what I need and you'll generate the full TypeScript code." },
  { icon: "🔬", label: "Research MCP & SDK upgrades", prompt: () => `Research the best Model Context Protocol (MCP) servers and SDK toolkits for AI-assisted architecture and regenerative design tools. List the top 5 with: what they do, install command (npm/pnpm), and how they'd enhance SolaraForge. Format as a numbered list.` },
  { icon: "📦", label: "Best materials for my biome", prompt: (p: Project) => `What are the optimal regenerative building materials for a ${p.biome ?? "temperate"} biome? Rank the top 6 by embodied carbon, availability, and suitability for a ${p.phase ?? "design"}-phase project like "${p.name}".` },
  { icon: "🛠️", label: "Phase action plan", prompt: (p: Project) => `Generate a detailed action plan for advancing "${p.name}" from the ${p.phase ?? "current"} phase to the next phase. Include specific tasks, who to hire, materials to order, and estimated timeline.` },
];

interface CreateModeFormState {
  name: string;
  route: string;
  description: string;
  features: string;
}

export default function AICollaborator({ project }: { project: Project }) {
  const { data: _conversations } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"chat" | "create">("chat");
  const [memory, setMemory] = useState(() => loadMemory(project.id));
  const [createForm, setCreateForm] = useState<CreateModeFormState>({
    name: "", route: "", description: "", features: ""
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeConvMessages = useListOpenaiMessages(activeConversationId!, {
    query: {
      enabled: !!activeConversationId,
      queryKey: getListOpenaiMessagesQueryKey(activeConversationId!),
    },
  });

  useEffect(() => {
    if (activeConvMessages.data) setMessages(activeConvMessages.data);
  }, [activeConvMessages.data]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const applyCode = async (filePath: string, code: string) => {
    const res = await fetch("/api/tools/apply-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, code }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error);
    }
    const { appliedTo } = await res.json();
    toast({ title: "Code applied!", description: appliedTo });
  };

  const handleApplyCode = async (filePath: string, code: string) => {
    try {
      await applyCode(filePath, code);
    } catch (err) {
      toast({ title: "Failed to apply code", description: String(err), variant: "destructive" });
    }
  };

  const sendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isTyping) return;

    setInput("");
    const newUserMessage = { role: "user", content: userMsg, id: Date.now() };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    let convId = activeConversationId;

    try {
      if (!convId) {
        const conv = await createConversation.mutateAsync({
          data: { title: `Chat about ${project.name}` },
        });
        convId = conv.id;
        setActiveConversationId(convId);
      }

      const projectContext = [
        `Project: ${project.name}`,
        project.biome ? `Biome: ${project.biome}` : "",
        project.phase ? `Phase: ${project.phase}` : "",
        project.description ? `Description: ${project.description}` : "",
        project.estimatedCost ? `Budget: $${project.estimatedCost.toLocaleString()}` : "",
      ].filter(Boolean).join("\n");

      const response = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userMsg,
          projectMemory: memory,
          projectContext,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const assistantMsgId = Date.now() + 1;
      setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantMsgId }]);

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const payload = JSON.parse(raw);
            if (payload.done) break;
            if (payload.content) {
              accumulated += payload.content;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulated } : m)
              );
            }
            if (payload.error) throw new Error(payload.error);
          } catch { /* skip non-JSON */ }
        }
      }

      const rememberMatch = accumulated.match(/\[REMEMBER:\s*([\s\S]+?)\]/i);
      if (rememberMatch) {
        const newFact = rememberMatch[1].trim();
        const updated = memory ? `${memory}\n- ${newFact}` : `- ${newFact}`;
        saveMemory(project.id, updated);
        setMemory(updated);
        toast({ title: "Memory updated", description: newFact });
      }
    } catch (error) {
      toast({ title: "AI error", description: "Failed to respond. Please try again.", variant: "destructive" });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFixTsErrors = (errors: string[]) => {
    const msg = `Fix all these TypeScript errors in my project:\n\n${errors.join("\n")}\n\nFor each error, show the corrected code block with the filepath comment so I can apply it directly.`;
    sendMessage(msg);
  };

  const handleCreateSubmit = () => {
    if (!createForm.name || !createForm.description) {
      toast({ title: "Name and description are required", variant: "destructive" });
      return;
    }
    const prompt = [
      `Generate a complete React TypeScript component for SolaraForge.`,
      `Component name: ${createForm.name}`,
      createForm.route ? `Route/path: ${createForm.route}` : "",
      `Description: ${createForm.description}`,
      createForm.features ? `Features to include:\n${createForm.features}` : "",
      `\nRequirements:`,
      `- Use shadcn/ui components and Tailwind CSS`,
      `- Match the SolaraForge brand (forest green primary #1a3a2a, amber accent #e8a020)`,
      `- Use TypeScript with proper types`,
      `- Include the filepath comment on the first line of every code block`,
      `- Export as default`,
    ].filter(Boolean).join("\n");

    setMode("chat");
    setCreateForm({ name: "", route: "", description: "", features: "" });
    sendMessage(prompt);
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setMode("chat");
  };

  return (
    <Card className="flex flex-col h-[680px] border-border/50 bg-card/50 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-sm">
            <Leaf className="w-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold leading-tight">SolaraForge AI</CardTitle>
            <p className="text-[10px] text-muted-foreground">Expert Regenerative Designer</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === "create" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode(m => m === "create" ? "chat" : "create")}
                  className={cn("h-7 px-2 gap-1 text-xs", mode === "create" && "bg-accent text-accent-foreground hover:bg-accent/90")}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Create
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a component or page from scratch</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="sm" onClick={startNewChat} className="h-7 px-2 gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> New
          </Button>
        </div>
      </CardHeader>

      {/* Memory panel */}
      <MemoryPanel projectId={project.id} memory={memory} onUpdate={setMemory} />

      {/* TS Error banner */}
      <TsErrorBanner onFixAll={handleFixTsErrors} />

      {/* Create mode */}
      {mode === "create" ? (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-semibold text-sm">Generate a New Component</span>
          </div>
          <p className="text-xs text-muted-foreground">Describe what you need and the AI will write the full TypeScript + Tailwind code, ready to apply to your project.</p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Component / Page Name *</label>
              <Input
                placeholder="e.g. SoilAnalysisDashboard, BiomePicker, EnergyReport"
                value={createForm.name}
                onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                className="bg-background/60 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Route or File Path (optional)</label>
              <Input
                placeholder="e.g. /soil-analysis  or  src/components/SoilDashboard.tsx"
                value={createForm.route}
                onChange={e => setCreateForm(f => ({ ...f, route: e.target.value }))}
                className="bg-background/60 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Description *</label>
              <Textarea
                placeholder="Describe what this component does, what data it shows, how the user interacts with it…"
                value={createForm.description}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                className="bg-background/60 text-sm min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Features to include (one per line)</label>
              <Textarea
                placeholder={"- Soil type selector (Clay, Loam, Sandy)\n- pH input with slider\n- Recommended plants based on soil\n- Export as PDF"}
                value={createForm.features}
                onChange={e => setCreateForm(f => ({ ...f, features: e.target.value }))}
                className="bg-background/60 text-sm font-mono min-h-[80px] resize-none"
              />
            </div>
          </div>

          <Button
            onClick={handleCreateSubmit}
            disabled={!createForm.name || !createForm.description || isTyping}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Component
          </Button>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4 pt-2">
                  <div className="text-center py-6 space-y-2 opacity-70">
                    <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="text-sm font-bold font-serif">Hello! I'm your SolaraForge AI.</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      I know your project, biome, and phase. I can generate code, fix errors, and research the best tools.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_ACTIONS.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(qa.prompt(project))}
                        className="flex items-center gap-2 text-left px-3 py-2 rounded-xl border border-border/50 bg-card/80 hover:bg-accent/5 hover:border-accent/30 transition-all text-xs"
                      >
                        <span className="text-base flex-shrink-0">{qa.icon}</span>
                        <span className="font-medium text-foreground/80">{qa.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col max-w-[90%] space-y-0.5",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/60 rounded-bl-none text-foreground border border-border/30 w-full"
                    )}
                  >
                    {m.role === "assistant"
                      ? parseMessageContent(m.content, handleApplyCode)
                      : m.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-1 text-muted-foreground px-2 py-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-accent/70 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-3 border-t bg-card/30 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={`Ask about ${project.name}…`}
                className="flex-1 bg-background/50 text-sm h-9"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="bg-accent text-accent-foreground h-9 w-9 flex-shrink-0"
              >
                {isTyping
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              ↵ send · <kbd className="font-mono">⌘K</kbd> command palette · memory stays between sessions
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
