---
name: SolaraForge PWA architecture
description: Stack decisions, API contract, localStorage conventions, and hook signatures for the SolaraForge React+Vite PWA.
---

## Stack
- React + Vite + TypeScript, wouter routing, shadcn/ui, TanStack Query
- Orval-generated hooks from @workspace/api-client-react
- pnpm monorepo; web artifact at artifacts/solaraforge-web

## Brand
- primary: #1a3a2a (forest green), accent: #e8a020 (amber), background: #f5f0e8 (parchment)

## API Contract
- ProjectInput only accepts: name, description, biome, phase, estimatedCost
- useUpdateProject signature: `mutateAsync({ id: number, data: ProjectUpdate })`
- useDeleteProject signature: `mutateAsync({ id: number })`
- API server on port 8080; web on PORT env var

## localStorage Conventions
- Material associations: `project-materials-${projectId}` (array of material IDs)
- Checklist items: `checklist-${projectId}` (object of itemId → boolean)
- No project_materials junction table in DB — all client-side only

## Key Patterns
- useDeleteProject exists and works; import from @workspace/api-client-react
- AlertDialog from @/components/ui/alert-dialog for destructive confirmations
- useLocation from wouter for programmatic navigation: `const [, navigate] = useLocation()`
- Dark mode: CSS class-based via `@custom-variant dark (&:is(.dark *))` in index.css

**Why:** API and localStorage shapes are easy to break when adding features; recording them prevents regressions when new components touch the same data.
