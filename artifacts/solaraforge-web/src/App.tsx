import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ProjectsList from "@/pages/ProjectsList";
import ProjectDetail from "@/pages/ProjectDetail";
import MaterialsLibrary from "@/pages/MaterialsLibrary";
import { Sidebar, MobileNav } from "@/components/layout/Navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/projects" component={ProjectsList} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/materials" component={MaterialsLibrary} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
