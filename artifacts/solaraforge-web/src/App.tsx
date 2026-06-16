import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
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
import { Sidebar, MobileNav } from "@/components/layout/Navigation";
import { AIDrawerProvider, AIDrawerTrigger } from "@/components/chat/AIDrawer";
import CommandPalette from "@/components/search/CommandPalette";

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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onOpenSearch={() => setCmdOpen(true)} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <MobileNav onOpenSearch={() => setCmdOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Switch>
            <Route path="/" component={Dashboard} />
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
