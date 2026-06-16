import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  TreePine, 
  Database, 
  Wand2,
  Info,
  Leaf, 
  Menu,
  Wrench,
  Globe,
  Settings,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Sidebar nav (full list shown in sidebar + sheet)
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projects", icon: TreePine },
  { href: "/tools", label: "Toolkit", icon: Wrench, badge: "5" },
  { href: "/materials", label: "Materials", icon: Database },
  { href: "/studio", label: "Studio", icon: Wand2 },
  { href: "/showcase", label: "Showcase", icon: Globe },
  { href: "/about", label: "About", icon: Info },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Bottom bar shows only 5 key items (rest accessible from hamburger)
const bottomNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: TreePine },
  { href: "/tools", label: "Toolkit", icon: Wrench, badge: "5" },
  { href: "/materials", label: "Materials", icon: Database },
  { href: "/studio", label: "Studio", icon: Wand2 },
];

interface SidebarProps {
  onOpenSearch: () => void;
}

export function Sidebar({ onOpenSearch }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="hidden border-r bg-sidebar md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-accent text-accent-foreground">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-serif font-bold text-sidebar-foreground">
              SolaraForge
            </span>
          </Link>
        </div>

        {/* Search button */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border/40 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="text-[9px] font-mono bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {"badge" in item && item.badge && (
                <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-accent/20 text-accent border-accent/30">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-4 border-t border-sidebar-border pt-3">
          <p className="text-[10px] text-sidebar-foreground/30 text-center">
            SolaraForge · Regenerative Design Platform
          </p>
        </div>
      </div>
    </div>
  );
}

interface MobileNavProps {
  onOpenSearch: () => void;
}

export function MobileNav({ onOpenSearch }: MobileNavProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between h-14 px-4 border-b bg-card">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          <span className="text-lg font-serif font-bold text-primary">SolaraForge</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOpenSearch} className="h-9 w-9">
            <Search className="w-5 h-5" />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0 border-none">
              <div className="flex flex-col h-full">
                <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
                  <Leaf className="w-5 h-5 text-accent mr-2" />
                  <span className="text-lg font-serif font-bold text-sidebar-foreground">SolaraForge</span>
                </div>
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                        location === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-accent/20 text-accent border-accent/30">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Bottom Nav — 5 items only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-card border-t border-border">
        {bottomNavItems.map((item) => {
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {"badge" in item && item.badge && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 flex items-center justify-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[9px] font-medium", active ? "text-primary" : "")}>{item.label}</span>
              {active && <span className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
