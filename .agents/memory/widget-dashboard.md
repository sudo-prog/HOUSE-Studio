---
name: Widget Dashboard Architecture
description: How the SolaraForge Mission Control widget system is structured
---

## Files
- `src/components/widgets/WidgetRegistry.ts` — central widget definitions, DEFAULT_LAYOUT, localStorage helpers
- `src/components/widgets/WidgetGrid.tsx` — GridLayout wrapper, mounts all active widgets
- `src/components/widgets/WidgetCard.tsx` — shell: header with `.drag-handle` class, expand dialog, remove button
- `src/components/widgets/widgets/` — individual widget components

## Widget Contract
Each widget is a plain React component (`() => ReactNode`) — no special props needed.
`WIDGET_COMPONENTS` map in WidgetGrid.tsx links id → component.
`WIDGET_FULL` map links id → expanded/full-screen component (optional).

## Adding a New Widget
1. Add entry to WIDGET_REGISTRY in WidgetRegistry.ts
2. Add entry to DEFAULT_LAYOUT
3. Create the component in widgets/
4. Add to WIDGET_COMPONENTS in WidgetGrid.tsx
5. Add icon to ICON_MAP in WidgetCard.tsx and Dashboard.tsx

## AIDrawer Context
`useAIDrawer()` exposes `{ open, close, openWithMessage }`.
`openWithMessage(msg)` opens drawer AND pre-fills the input.

## Workflow Page
`/workflow` uses @xyflow/react. Custom node type `widgetNode` requires
`<Handle>` components inside for edges to connect.
