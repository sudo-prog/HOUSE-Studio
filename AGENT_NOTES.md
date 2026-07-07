# Agent Notes — SolaraForge (HOUSE_STUDIO)
**Last updated:** 2026-06-22
**Status:** Full-stack application complete — needs deployment and testing

---

## Project Overview

AI-powered solarpunk regenerative habitat designer. Full-stack pnpm monorepo with Express API, React/Vite frontend, PostgreSQL/Drizzle ORM, and OpenAI integration for habitat design assistance.

- **Repo:** `git@github.com:Sudo-Prog/solaraforge.git` (assumed)
- **Stack:** pnpm monorepo, Node.js 24, TypeScript 5.9, Express 5, React 19, Vite, PostgreSQL, Drizzle ORM, OpenAI
- **Artifacts:** api-server, solaraforge-web, mockup-sandbox
- **DB tables:** projects, materials, conversations, messages, design_specs

---

## Architecture

### Monorepo Structure
```
artifacts/
  api-server/       — Express API (routes, lib, middleware)
  solaraforge-web/  — React/Vite frontend (pages, components, lib)
  mockup-sandbox/   — UI component sandbox
lib/
  api-spec/         — OpenAPI YAML spec + Orval config
  api-zod/          — Generated Zod schemas
  api-client-react/ — Generated React Query hooks
  auth-web/         — Authentication hooks
  db/               — Drizzle ORM schema + migrations
  integrations/
    openai-ai-server/ — OpenAI client wrapper
scripts/            — Build/merge scripts
```

### API Routes
| Route | Endpoints |
|-------|-----------|
| `/api/healthz` | GET health check |
| `/api/projects` | GET list, GET stats, GET :id, POST, PATCH :id, DELETE :id |
| `/api/materials` | GET featured, GET list (filter by category/maxCarbon), GET :id |
| `/api/moodboard` | POST analyze (multer upload, OpenAI vision → SolaraSpec JSON) |
| `/api/openai/conversations` | GET list, POST create, GET :id, DELETE :id |
| `/api/openai/messages` | GET list, POST send (streaming) |
| `/api/tools` | GET ts-check, POST generate-palette |

### Database Schema
- **projects** — id, name, description, biome, phase, solarScore, embodiedCarbon, waterHarvesting, estimatedCost, status, thumbnailUrl, timestamps
- **materials** — id, name, category, description, embodiedCarbon, localAvailability, durabilityYears, recyclability, isFeatured, tags[], imageUrl
- **conversations** — id, title, createdAt
- **messages** — id, conversationId, role, content, createdAt
- **design_specs** — id, projectId, title, biome, summary, palette[], tags[], suggestedMaterials[], parametricHints, estimatedCarbon, sourceDescription

### Frontend Pages
Dashboard, ProjectsList, ProjectDetail, Studio, MaterialsLibrary, Showcase, About, Workflow, Tools, Settings, NotFound

### Frontend Components
ai/, chat/, help/, layout/, materials/, onboarding/, projects/, search/, tools/, ui/, widgets/, wizard/

---

## Development Roadmap

### Completed
- [x] pnpm monorepo scaffold with security hardening (minimumReleaseAge: 1440)
- [x] PostgreSQL + Drizzle ORM schema (projects, materials, conversations, messages, design_specs)
- [x] Express API server with CORS, pino logging, JSON parsing
- [x] Full REST API: projects CRUD, materials listing/filtering, moodboard analysis, OpenAI chat, tools
- [x] OpenAI integration: conversation management, streaming messages, SolaraSystem prompt
- [x] Moodboard analysis: multer image upload → OpenAI vision → structured SolaraSpec JSON
- [x] React/Vite frontend with 11 pages
- [x] React Query for API data fetching
- [x] Wouter for routing (lightweight)
- [x] Command palette (⌘J), keyboard shortcuts (? for help)
- [x] G+key navigation shortcuts
- [x] Dark/light/system theme with localStorage persistence
- [x] PWA service worker registration
- [x] Tailwind CSS v4 with class-variance-authority, tailwind-merge
- [x] UI component library (shadcn-style: accordion, avatar, button, checkbox, command, dialog, dropdown, field, hover-card, input, input-otp, label, popover, progress, resizable, select, separator, sheet, sidebar, skeleton, sonner, tabs, toast, toggle, toggle-group, tooltip)
- [x] Framer-motion animations
- [x] Lucide React icons
- [x] Mockup sandbox for UI components

### In Progress / Not Yet Built
- [ ] Database migrations (schema defined but migrations not generated)
- [ ] Frontend-backend integration (API client hooks generated but not wired to pages)
- [ ] Authentication (auth-web lib exists but not integrated)
- [ ] Project CRUD UI (pages exist but may not be fully wired)
- [ ] Materials library UI
- [ ] Moodboard image upload UI
- [ ] AI chat drawer UI
- [ ] Design spec generation and display
- [ ] Workflow page implementation
- [ ] Tools page implementation
- [ ] Settings page implementation
- [ ] Showcase/gallery feature
- [ ] Onboarding wizard
- [ ] Widget system
- [ ] Deployment pipeline
- [ ] E2E tests

### Known Issues
- pnpm-workspace.yaml has Replit-specific packages in catalog (@replit/* plugins) — needs cleanup for local dev
- minimumReleaseAge excludes @replit/* — remove when moving off Replit
- esbuild pinned to 0.27.3 via override (security fix)
- No authentication implemented yet (client-side only)

---

## Common Pitfalls
- **Drizzle numeric columns** returned as `string` — always cast: `Number(project.embodiedCarbon)`
- **pnpm workspace** — use `pnpm` only, package-lock.json/yarn.lock are blocked by preinstall script
- **API client hooks** in `lib/api-client-react` are generated — run `pnpm --filter @workspace/api-client-react run codegen` after schema changes
- **Theme** — CSS vars use HSL without wrapper: `--primary: 43 65% 52%`
- **Routing** — uses wouter (not react-router)
- **OpenAI** — requires `OPENAI_API_KEY` env var; moodboard analysis requires vision model

---

## File Reference
| Path | Purpose |
|------|---------|
| `artifacts/api-server/src/app.ts` | Express app setup |
| `artifacts/api-server/src/routes/index.ts` | Route aggregation |
| `artifacts/api-server/src/routes/projects.ts` | Project CRUD |
| `artifacts/api-server/src/routes/materials.ts` | Materials listing |
| `artifacts/api-server/src/routes/moodboard.ts` | AI moodboard analysis |
| `artifacts/api-server/src/routes/openai.ts` | OpenAI chat |
| `artifacts/api-server/src/routes/tools.ts` | Dev tools (ts-check, palette gen) |
| `artifacts/solaraforge-web/src/App.tsx` | React app root with routing |
| `artifacts/solaraforge-web/src/main.tsx` | Entry point + PWA + theme |
| `lib/db/src/schema/` | All Drizzle table definitions |
| `lib/api-zod/src/` | Zod validation schemas |
| `lib/integrations/openai-ai-server/` | OpenAI client wrapper |
| `pnpm-workspace.yaml` | Workspace config + security settings |
