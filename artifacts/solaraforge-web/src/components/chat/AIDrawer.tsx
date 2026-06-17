import { useState, useRef, useCallback, createContext, useContext } from "react";
import {
  useCreateOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey,
} from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf, MessageCircle, Plus, Send, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  id: number;
  role: string;
  content: string;
}

interface AIDrawerContextValue {
  open: (projectName?: string) => void;
  close: () => void;
  openWithMessage: (message: string) => void;
}

const AIDrawerContext = createContext<AIDrawerContextValue>({
  open: () => {},
  close: () => {},
  openWithMessage: () => {},
});

export function useAIDrawer() {
  return useContext(AIDrawerContext);
}

interface Props {
  children: React.ReactNode;
}

export function AIDrawerProvider({ children }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [projectContext, setProjectContext] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createConversation = useCreateOpenaiConversation();

  const open = useCallback((pName?: string) => {
    setProjectContext(pName);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const openWithMessage = useCallback((message: string) => {
    setIsOpen(true);
    setInput(message);
  }, []);

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (el) el.scrollTop = el.scrollHeight;
      }
    }, 50);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");

    const msgId = Date.now();
    setMessages(prev => [...prev, { id: msgId, role: "user", content: userMsg }]);
    setIsTyping(true);
    scrollToBottom();

    let convId = conversationId;

    try {
      if (!convId) {
        const title = projectContext ? `Chat about ${projectContext}` : "SolaraForge Chat";
        const conv = await createConversation.mutateAsync({ data: { title } });
        convId = conv.id;
        setConversationId(convId);
      }

      const response = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg }),
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      const assistantId = Date.now() + 1;
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);
      scrollToBottom();

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            try {
              const payload = JSON.parse(raw);
              if (payload.done) break;
              if (payload.content) {
                accumulated += payload.content;
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
                );
                scrollToBottom();
              }
            } catch { /* skip non-JSON */ }
          }
        }
      }

      if (convId) {
        queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(convId) });
      }
    } catch (err) {
      toast({ title: "Error", description: "AI failed to respond. Check your API key settings.", variant: "destructive" });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AIDrawerContext.Provider value={{ open, close, openWithMessage }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[440px] p-0 flex flex-col bg-card">
          <SheetHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Leaf className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold leading-none">SolaraForge AI</SheetTitle>
                {projectContext && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{projectContext}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={startNewChat} className="h-8 gap-1 text-xs">
              <Plus className="h-3 w-3" /> New Chat
            </Button>
          </SheetHeader>

          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[240px] text-center space-y-4 text-muted-foreground">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Leaf className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-serif text-foreground">SolaraForge AI Collaborator</p>
                    <p className="text-xs opacity-70 max-w-xs mt-1">
                      {projectContext
                        ? `Ask me about ${projectContext} — materials, solar design, carbon calculations, or any regenerative building question.`
                        : "Ask me about regenerative materials, passive solar design, embodied carbon, or any habitat design question."}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    {(projectContext ? [
                      `What materials suit a ${projectContext}?`,
                      "How do I improve my solar score?",
                      "Estimate embodied carbon for this project",
                      "What's the best insulation for my climate?",
                    ] : [
                      "Best carbon-negative wall systems?",
                      "How does passive solar design work?",
                      "Compare hempcrete vs straw bale",
                      "How to harvest rainwater for a family of 4?",
                      "What is a SolaraSpec?",
                    ]).map(q => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-[11px] px-2.5 py-1.5 rounded-full border border-border/50 bg-muted/40 hover:bg-accent/10 hover:border-accent/40 hover:text-accent transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(m => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col max-w-[88%] space-y-1",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted rounded-bl-none text-foreground"
                  )}>
                    {m.content || (m.role === "assistant" && isTyping ? (
                      <span className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </span>
                    ) : "")}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form
            className="px-4 py-3 border-t bg-card flex gap-2"
            onSubmit={e => { e.preventDefault(); handleSend(); }}
          >
            <Input
              data-testid="input-ai-chat"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about materials, solar design…"
              className="flex-1 bg-background/70 rounded-full text-sm"
              disabled={isTyping}
            />
            <Button
              data-testid="button-ai-send"
              type="submit"
              size="icon"
              disabled={isTyping || !input.trim()}
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </AIDrawerContext.Provider>
  );
}

export function AIDrawerTrigger({ projectName }: { projectName?: string }) {
  const { open } = useAIDrawer();
  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 group flex flex-col items-center gap-1.5">
      <span className="hidden md:flex items-center gap-1 text-[10px] bg-card/90 backdrop-blur text-muted-foreground border border-border/60 rounded-full px-2 py-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        <kbd className="font-mono text-[9px]">⌘J</kbd> AI Collaborator
      </span>
      <Button
        data-testid="button-open-ai-drawer"
        onClick={() => open(projectName)}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 transition-transform"
        title="AI Collaborator (⌘J)"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
