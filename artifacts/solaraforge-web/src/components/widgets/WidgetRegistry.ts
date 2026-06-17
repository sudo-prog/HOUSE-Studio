export interface WidgetProps {
  isExpanded?: boolean;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  icon: string;
  description: string;
  defaultLayout: { w: number; h: number; minW: number; minH: number };
}

export type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: "stats",
    title: "Impact Stats",
    icon: "BarChart3",
    description: "Carbon, solar, water & project metrics at a glance",
    defaultLayout: { w: 12, h: 2, minW: 4, minH: 2 },
  },
  {
    id: "projects",
    title: "My Projects",
    icon: "TreePine",
    description: "Your habitat projects and quick access",
    defaultLayout: { w: 7, h: 5, minW: 4, minH: 3 },
  },
  {
    id: "solar",
    title: "Solar Monitor",
    icon: "Sun",
    description: "Live solar panel yield calculator",
    defaultLayout: { w: 5, h: 5, minW: 3, minH: 4 },
  },
  {
    id: "power",
    title: "Off-Grid Power",
    icon: "Battery",
    description: "Simulate battery, solar & load balance",
    defaultLayout: { w: 5, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "garden",
    title: "Food Garden",
    icon: "Leaf",
    description: "Quick garden beds & water calculator",
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "materials",
    title: "Materials",
    icon: "Package",
    description: "Featured regenerative materials",
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 3 },
  },
  {
    id: "toolkit",
    title: "Design Toolkit",
    icon: "Wrench",
    description: "Quick-launch all 10 design calculators",
    defaultLayout: { w: 8, h: 3, minW: 4, minH: 2 },
  },
  {
    id: "ai",
    title: "AI Assistant",
    icon: "Sparkles",
    description: "Ask your regenerative habitat AI anything",
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 2 },
  },
  {
    id: "impact",
    title: "Environmental Impact",
    icon: "Globe",
    description: "Your regenerative footprint — trees, car journeys & more",
    defaultLayout: { w: 6, h: 4, minW: 4, minH: 3 },
  },
  {
    id: "tip",
    title: "Solarpunk Tip",
    icon: "Lightbulb",
    description: "Daily regenerative design insight, shuffleable on demand",
    defaultLayout: { w: 6, h: 3, minW: 3, minH: 2 },
  },
];

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "stats",     x: 0,  y: 0,  w: 12, h: 2,  minW: 4,  minH: 2 },
  { i: "projects",  x: 0,  y: 2,  w: 7,  h: 5,  minW: 4,  minH: 3 },
  { i: "solar",     x: 7,  y: 2,  w: 5,  h: 5,  minW: 3,  minH: 4 },
  { i: "power",     x: 0,  y: 7,  w: 5,  h: 4,  minW: 3,  minH: 3 },
  { i: "garden",    x: 5,  y: 7,  w: 4,  h: 4,  minW: 3,  minH: 3 },
  { i: "materials", x: 9,  y: 7,  w: 3,  h: 4,  minW: 2,  minH: 3 },
  { i: "toolkit",   x: 0,  y: 11, w: 8,  h: 3,  minW: 4,  minH: 2 },
  { i: "ai",        x: 8,  y: 11, w: 4,  h: 3,  minW: 3,  minH: 2 },
  { i: "impact",    x: 0,  y: 14, w: 6,  h: 4,  minW: 4,  minH: 3 },
  { i: "tip",       x: 6,  y: 14, w: 6,  h: 4,  minW: 3,  minH: 2 },
];

const STORAGE_KEY = "solaraforge-widget-layout";

export function loadLayout(): LayoutItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: LayoutItem[] = JSON.parse(saved);
      // Merge: add any new widgets from DEFAULT_LAYOUT that aren't in saved
      const ids = new Set(parsed.map(l => l.i));
      const extra = DEFAULT_LAYOUT.filter(l => !ids.has(l.i));
      return [...parsed, ...extra];
    }
  } catch {}
  return DEFAULT_LAYOUT;
}

export function saveLayout(layout: LayoutItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {}
}

export function loadActiveWidgets(): string[] {
  try {
    const saved = localStorage.getItem("solaraforge-active-widgets");
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      // Always include newly registered widgets
      const allIds = WIDGET_REGISTRY.map(w => w.id);
      const merged = [...new Set([...parsed, ...allIds.filter(id => !parsed.includes(id))])];
      return merged;
    }
  } catch {}
  return WIDGET_REGISTRY.map(w => w.id);
}

export function saveActiveWidgets(ids: string[]): void {
  try {
    localStorage.setItem("solaraforge-active-widgets", JSON.stringify(ids));
  } catch {}
}
