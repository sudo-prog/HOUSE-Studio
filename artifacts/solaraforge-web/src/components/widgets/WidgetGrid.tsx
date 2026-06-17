import { useState, useCallback, useRef, useEffect } from "react";
import { GridLayout } from "react-grid-layout";
import type { LayoutItem } from "react-grid-layout";
import { WIDGET_REGISTRY, loadLayout, saveLayout, loadActiveWidgets, saveActiveWidgets } from "./WidgetRegistry";
import type { LayoutItem as WLayoutItem } from "./WidgetRegistry";
import WidgetCard from "./WidgetCard";
import StatsWidget from "./widgets/StatsWidget";
import ProjectsWidget from "./widgets/ProjectsWidget";
import SolarMonitorWidget from "./widgets/SolarMonitorWidget";
import PowerSystemWidget from "./widgets/PowerSystemWidget";
import GardenWidget from "./widgets/GardenWidget";
import MaterialsWidget from "./widgets/MaterialsWidget";
import ToolkitWidget from "./widgets/ToolkitWidget";
import AIWidget from "./widgets/AIWidget";
import ImpactWidget from "./widgets/ImpactWidget";
import TipWidget from "./widgets/TipWidget";
import SolarDesigner from "@/components/tools/SolarDesigner";
import FoodGardenPlanner from "@/components/tools/FoodGardenPlanner";

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  stats:     StatsWidget,
  projects:  ProjectsWidget,
  solar:     SolarMonitorWidget,
  power:     PowerSystemWidget,
  garden:    GardenWidget,
  materials: MaterialsWidget,
  toolkit:   ToolkitWidget,
  ai:        AIWidget,
  impact:    ImpactWidget,
  tip:       TipWidget,
};

const WIDGET_FULL: Record<string, React.ComponentType | undefined> = {
  solar:  SolarDesigner,
  garden: FoodGardenPlanner,
};

interface WidgetGridProps {
  isEditing: boolean;
}

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(ref.current);
    setWidth(ref.current.offsetWidth);
    return () => observer.disconnect();
  }, []);

  return { width, ref };
}

export default function WidgetGrid({ isEditing }: WidgetGridProps) {
  const { width, ref } = useContainerWidth();
  const [layout, setLayout] = useState<WLayoutItem[]>(loadLayout);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(loadActiveWidgets);

  // Convert WLayoutItem → react-grid-layout's LayoutItem for the grid
  const toRglItem = (item: WLayoutItem): LayoutItem => ({
    i: item.i, x: item.x, y: item.y, w: item.w, h: item.h,
    ...(item.minW !== undefined ? { minW: item.minW } : {}),
    ...(item.minH !== undefined ? { minH: item.minH } : {}),
  });

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(prev => {
      const updated: WLayoutItem[] = prev.map(l => {
        const found = newLayout.find(m => m.i === l.i);
        return found ? { ...l, x: found.x, y: found.y, w: found.w, h: found.h } : l;
      });
      saveLayout(updated);
      return updated;
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    const next = activeWidgets.filter(w => w !== id);
    setActiveWidgets(next);
    saveActiveWidgets(next);
  }, [activeWidgets]);

  const activeLayout = layout.filter(l => activeWidgets.includes(l.i)).map(toRglItem);

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <GridLayout
          width={width}
          layout={activeLayout}
          gridConfig={{
            cols: 12,
            rowHeight: 80,
            margin: [12, 12] as [number, number],
            containerPadding: [0, 0] as [number, number],
          }}
          dragConfig={{ enabled: isEditing, handle: ".drag-handle" }}
          resizeConfig={{ enabled: isEditing, handles: ["se"] as ["se"] }}
          onLayoutChange={handleLayoutChange}
          autoSize
        >
          {activeLayout.map(item => {
            const def = WIDGET_REGISTRY.find(w => w.id === item.i);
            const Component = WIDGET_COMPONENTS[item.i];
            if (!def || !Component) return null;
            const FullComponent = WIDGET_FULL[item.i];
            return (
              <div key={item.i} className="overflow-hidden">
                <WidgetCard
                  id={item.i}
                  title={def.title}
                  icon={def.icon}
                  onRemove={() => removeWidget(item.i)}
                  isEditing={isEditing}
                  fullContent={FullComponent ? <FullComponent /> : undefined}
                >
                  <Component />
                </WidgetCard>
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
