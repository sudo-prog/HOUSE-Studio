---
name: react-grid-layout v2 API
description: How to use react-grid-layout v2.x — breaking changes from v1
---

## Key v2 Changes

**No WidthProvider**: Removed in v2. Use a custom `useContainerWidth` hook with ResizeObserver instead.

```tsx
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(es => { const w = es[0]?.contentRect.width; if (w) setWidth(w); });
    obs.observe(ref.current);
    setWidth(ref.current.offsetWidth);
    return () => obs.disconnect();
  }, []);
  return { width, ref };
}
```

**Config via nested objects** (not flat props):
- `gridConfig={{ cols: 12, rowHeight: 80, margin: [12,12] as [number,number] }}`
- `dragConfig={{ enabled: bool, handle: ".drag-handle" }}`
- `resizeConfig={{ enabled: bool, handles: ["se"] as ["se"] }}`

**CSS**: Only `react-grid-layout/css/styles.css` — `react-resizable/css/styles.css` does NOT exist in v2.

**Types**: `LayoutItem` from `"react-grid-layout"` has `{ i, x, y, w, h, minW?, minH? }`.
`onLayoutChange: (layout: LayoutItem[]) => void` — single arg, not (layout, allLayouts).

**Why**: v2 was a complete rewrite shipped around 2024-2025 that made WidthProvider obsolete.
