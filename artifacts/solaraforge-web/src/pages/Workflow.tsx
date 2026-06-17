import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TreePine, Sun, Battery, Leaf, Package, Wrench, Sparkles,
  ArrowLeft, Info, Workflow as WorkflowIcon, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  stats: BarChart3,
  projects: TreePine,
  solar: Sun,
  power: Battery,
  garden: Leaf,
  materials: Package,
  toolkit: Wrench,
  ai: Sparkles,
};

const COLORS: Record<string, { border: string; bg: string; icon: string }> = {
  stats:     { border: "border-primary/50",  bg: "bg-primary/5",  icon: "text-primary" },
  projects:  { border: "border-emerald-400/50", bg: "bg-emerald-50", icon: "text-emerald-600" },
  solar:     { border: "border-amber-400/50", bg: "bg-amber-50",  icon: "text-amber-500" },
  power:     { border: "border-blue-400/50", bg: "bg-blue-50",   icon: "text-blue-500" },
  garden:    { border: "border-green-400/50", bg: "bg-green-50", icon: "text-green-600" },
  materials: { border: "border-orange-400/50", bg: "bg-orange-50", icon: "text-orange-600" },
  toolkit:   { border: "border-purple-400/50", bg: "bg-purple-50", icon: "text-purple-600" },
  ai:        { border: "border-accent/50",   bg: "bg-accent/5",  icon: "text-accent" },
};

function WidgetNode({ data }: { data: { id: string; label: string; description: string } }) {
  const Icon = ICONS[data.id] ?? Sparkles;
  const c = COLORS[data.id] ?? COLORS.ai;
  return (
    <div className={cn(
      "min-w-[160px] max-w-[200px] p-3 rounded-2xl border-2 shadow-md bg-card",
      c.border
    )}>
      <Handle type="target" position={Position.Top} className="!bg-border !border-border/50 !w-2 !h-2" />
      <div className={cn("flex items-center gap-2 mb-2")}>
        <div className={cn("p-1.5 rounded-lg", c.bg)}>
          <Icon className={cn("h-4 w-4", c.icon)} />
        </div>
        <span className="text-xs font-bold text-foreground">{data.label}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">{data.description}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-border !border-border/50 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { widgetNode: WidgetNode };

const WIDGET_DEFS = [
  { id: "stats",     label: "Impact Stats",    description: "Aggregates carbon, water & solar metrics" },
  { id: "projects",  label: "My Projects",     description: "Project catalog & phase tracker" },
  { id: "solar",     label: "Solar Monitor",   description: "Live panel yield & sufficiency calc" },
  { id: "power",     label: "Off-Grid Power",  description: "Battery, solar & load simulation" },
  { id: "garden",    label: "Food Garden",     description: "Bed count & water needs calculator" },
  { id: "materials", label: "Materials",       description: "Featured sustainable materials" },
  { id: "toolkit",   label: "Design Toolkit",  description: "10 engineering calculators" },
  { id: "ai",        label: "AI Assistant",    description: "Regenerative design collaborator" },
];

const INITIAL_NODES: Node[] = [
  { id: "stats",     type: "widgetNode", position: { x: 400, y: 20  }, data: WIDGET_DEFS[0] },
  { id: "projects",  type: "widgetNode", position: { x: 40,  y: 160 }, data: WIDGET_DEFS[1] },
  { id: "solar",     type: "widgetNode", position: { x: 280, y: 180 }, data: WIDGET_DEFS[2] },
  { id: "power",     type: "widgetNode", position: { x: 520, y: 200 }, data: WIDGET_DEFS[3] },
  { id: "garden",    type: "widgetNode", position: { x: 760, y: 160 }, data: WIDGET_DEFS[4] },
  { id: "materials", type: "widgetNode", position: { x: 160, y: 360 }, data: WIDGET_DEFS[5] },
  { id: "toolkit",   type: "widgetNode", position: { x: 400, y: 360 }, data: WIDGET_DEFS[6] },
  { id: "ai",        type: "widgetNode", position: { x: 660, y: 360 }, data: WIDGET_DEFS[7] },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1", source: "projects", target: "stats",    label: "feeds",        animated: true,  style: { stroke: "#1a3a2a" } },
  { id: "e2", source: "solar",    target: "power",    label: "solar input",  animated: true,  style: { stroke: "#e8a020" } },
  { id: "e3", source: "solar",    target: "stats",    label: "solar score",  animated: false, style: { stroke: "#e8a020", strokeDasharray: "5 5" } },
  { id: "e4", source: "garden",   target: "stats",    label: "water use",    animated: false, style: { stroke: "#22c55e", strokeDasharray: "5 5" } },
  { id: "e5", source: "materials",target: "projects", label: "used in",      animated: false, style: { stroke: "#f97316", strokeDasharray: "5 5" } },
  { id: "e6", source: "toolkit",  target: "solar",    label: "solar design", animated: false, style: { stroke: "#a855f7", strokeDasharray: "5 5" } },
  { id: "e7", source: "toolkit",  target: "garden",   label: "garden plan",  animated: false, style: { stroke: "#a855f7", strokeDasharray: "5 5" } },
  { id: "e8", source: "ai",       target: "projects", label: "AI insight",   animated: true,  style: { stroke: "#e8a020" } },
  { id: "e9", source: "ai",       target: "materials",label: "recommends",   animated: true,  style: { stroke: "#e8a020" } },
];

const STORAGE_NODES = "solaraforge-workflow-nodes";
const STORAGE_EDGES = "solaraforge-workflow-edges";

function loadNodes(): Node[] {
  try {
    const s = localStorage.getItem(STORAGE_NODES);
    if (s) return JSON.parse(s);
  } catch {}
  return INITIAL_NODES;
}

function loadEdges(): Edge[] {
  try {
    const s = localStorage.getItem(STORAGE_EDGES);
    if (s) return JSON.parse(s);
  } catch {}
  return INITIAL_EDGES;
}

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(loadNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(loadEdges());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_NODES, JSON.stringify(nodes)); } catch {}
  }, [nodes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_EDGES, JSON.stringify(edges)); } catch {}
  }, [edges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: "#e8a020" } }, eds)),
    [setEdges]
  );

  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_NODES);
    localStorage.removeItem(STORAGE_EDGES);
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
  }, [setNodes, setEdges]);

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-0px)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-serif text-lg font-bold flex items-center gap-2">
            <WorkflowIcon className="h-4 w-4 text-accent" />
            Widget Workflow
          </h1>
          <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">
            Data Flow Map
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Drag nodes · Draw connections · Animated = live data flow
          </div>
        </div>
      </div>

      {/* Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ labelStyle: { fontSize: 10 }, labelBgStyle: { fill: "#f5f0e8" } }}
          style={{ background: "hsl(var(--background))" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--border))" />
          <Controls className="shadow-md" />
          <MiniMap
            nodeColor={node => {
              const c = COLORS[node.id];
              return c ? "hsl(var(--primary) / 0.3)" : "#ccc";
            }}
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          />
          <Panel position="bottom-center" className="mb-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border/50 bg-card/90 backdrop-blur-sm shadow-md text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-primary rounded inline-block" /> live data flow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 border-t border-dashed border-muted-foreground inline-block" /> reference
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>Click + drag between nodes to add connections</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
