import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, useCallback, useRef } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ProjectsList from "@/pages/ProjectsList";
import ProjectDetail from "@/pages/ProjectDetail";
import MaterialsLibrary from "@/pages/MaterialsLibrary";
import Studio from "@/pages/Studio";
import About from "@/pages/About";
import Tools from "@/pages/Tools";
import Showcase from "@/pages/Showcase";
import Settings from "@/pages/Settings";
import WorkflowPage from "@/pages/Workflow";
import { Sidebar, MobileNav } from "@/components/layout/Navigation";
import { AIDrawerProvider, AIDrawerTrigger } from "@/components/chat/AIDrawer";
import CommandPalette from "@/components/search/CommandPalette";
import KeyboardShortcutsDialog from "@/components/help/KeyboardShortcutsDialog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Router() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [, navigate] = useLocation();
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    const isEditable = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
    if (isEditable) return;

    if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShortcutsOpen(s => !s);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "j") {
      e.preventDefault();
      const btn = document.querySelector<HTMLButtonElement>("[data-testid='button-open-ai-drawer']");
      btn?.click();
      return;
    }

    // G+key navigation shortcuts
    if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      gPending.current = true;
      if (gTimer.current) clearTimeout(gTimer.current);
      gTimer.current = setTimeout(() => { gPending.current = false; }, 800);
      return;
    }
    if (gPending.current) {
      gPending.current = false;
      if (gTimer.current) clearTimeout(gTimer.current);
      const routes: Record<string, string> = {
        h: "/", p: "/projects", m: "/materials", t: "/tools",
        s: "/studio", w: "/workflow", c: "/showcase", a: "/about",
      };
      const route = routes[e.key.toLowerCase()];
      if (route) { e.preventDefault(); navigate(route); }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      <Sidebar onOpenSearch={() => setCmdOpen(true)} />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <MobileNav onOpenSearch={() => setCmdOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/workflow" component={WorkflowPage} />
            <Route path="/projects" component={ProjectsList} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/materials" component={MaterialsLibrary} />
            <Route path="/tools" component={Tools} />
            <Route path="/studio" component={Studio} />
            <Route path="/showcase" component={Showcase} />
            <Route path="/settings" component={Settings} />
            <Route path="/about" component={About} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AIDrawerProvider>
            <Router />
            <AIDrawerTrigger />
          </AIDrawerProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
