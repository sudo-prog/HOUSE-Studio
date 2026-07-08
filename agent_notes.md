# Agent Notes — House Studio (SolaraForge)

Architecture decisions, file structure, API patterns, and known issues.

---

## Project Path
`/home/thinkpad/Data/20_Projects/20.09_HOUSE_STUDIO/07_HOUSE-Studio/`

## Repository
- GitHub: `sudo-prog/HOUSE-Studio` (private)
- Main branch: `main`
- pnpm monorepo with workspaces

## Monorepo Structure
- `artifacts/solaraforge-web/` — React 19 frontend (Vite 7, Tailwind 4, shadcn/ui, Zustand, TanStack Query, React Grid Layout, XYFlow)
- `artifacts/api-server/` — Express 5 backend (Drizzle ORM, PostgreSQL, OpenAI integration)
- `artifacts/solaraforge-mobile/` — **Expo (React Native) mobile app** — Expo Router, tabs (Projects/Materials/Profile), project detail screen. Uses shared `@workspace/api-client-react`. Builds via `node scripts/build.js` (static Expo Go bundle) + `node server/serve.js`.
- `lib/db/` — Shared database schema (Drizzle), migrations (`./drizzle/*.sql`)
- `lib/api-zod/` — Shared Zod schemas, API client
- `lib/api-client-react/` — Generated API client for frontend (orval/openapi)
- `lib/integrations-openai-ai-react/` — Voice/audio React hooks
- `lib/integrations-openai-ai-server/` — OpenAI server utilities

## Key Technologies
- Frontend: React 19, Vite 7, Tailwind CSS 4, shadcn/ui, Zustand, TanStack Query, React Grid Layout, XYFlow (node editor)
- Backend: Express 5, Drizzle ORM, PostgreSQL, OpenAI (GPT-4o-mini), Zod
- AI: OpenAI for habitat design conversations, streaming responses
- PWA: vite-plugin-pwa with service worker registration
- Auth: Session-based with API middleware

## Vercel Deployment Configuration
- Web app deployed via Vercel
- API server can be colocated or deployed separately
- PWA support enabled with workbox

## Audit Fixes (2026-07-05)

### API Client Base URL Wiring
- `artifacts/solaraforge-web/src/main.tsx` — Added `setBaseUrl(import.meta.env.VITE_API_BASE_URL)` to enable API calls to the backend server. Without this, relative fetches would hit the static Vercel frontend and 404.

### Mobile / Touch Support
- Web app uses responsive grid layout (React Grid Layout)
- Mobile viewport already configured in index.html with proper meta tags

### AI Integration
- `artifacts/api-server/src/routes/openai.ts` — Full OpenAI streaming chat with:
  - Conversation history storage
  - Project context injection
  - Project memory support
  - SSE streaming responses
- `lib/integrations-openai-ai-react/` — Voice recorder and playback hooks

### Known Issues / Gaps
- AI requires `OPENAI_API_KEY` environment variable
- PostgreSQL required for DB-backed routes (conversation history, projects, materials)
- **No auth layer yet** — routes are open. The mobile app reads public endpoints (health/projects/materials). If auth is added later, wire `setAuthTokenGetter` + a token exchange route (see sibling studios for the pattern).
- React Native Reanimated / gesture-handler / keyboard-controller NOT pulled into the mobile app to keep the build lean (only the deps the screens use). Add them if richer interaction is needed.

---

## Deployment Checklist
- [x] `vercel.json` committed (Vite preset, build = `cd artifacts/solaraforge-web && pnpm run build`, out = `dist/public`)
- [x] DB migrations generated (`lib/db/drizzle/*.sql`) — run `pnpm --filter @workspace/db push` against a live Postgres
- [ ] Set `VITE_API_BASE_URL` in Vercel dashboard to point to the API server
- [ ] Set `OPENAI_API_KEY` for AI functionality
- [ ] Provision + migrate PostgreSQL (DATABASE_URL) for the API server
- [ ] Mobile app: `pnpm --filter @workspace/solaraforge-mobile build` produces a static Expo Go bundle in `static-build/`

## 2026-07-08 Audit + Fixes
- **FIXED:** `vite.config.ts` threw if `PORT`/`BASE_PATH` were unset → Vercel build would crash. Now defaults to `PORT=3000`, `BASE_PATH=/`.
- **FIXED:** `lib/integrations-openai-ai-react` only declared `react` as a peer dep, so `tsc --build` failed (TS2307). Added `react`/`react-dom`/`@types/react` as devDependencies. `pnpm run typecheck` now passes.
- **ADDED:** `lib/db/drizzle/` migrations from the existing schema (previously none existed). `drizzle-kit generate` succeeded.
- **ADDED:** `artifacts/solaraforge-mobile/` Expo app (was missing — every sibling studio has a `*-mobile` app). Mirrors the WWW/MAKE/PWA mobile structure: Expo Router tabs, real API hooks (health/projects/materials), shared client, build/serve scripts. Typechecks cleanly.
- **ADDED:** `vercel.json` and `.env.example`.

## 2026-07-09 Route Audit (chief-of-staff agent)
- **Frontend**: `artifacts/solaraforge-web` (the Vercel build target — NOT `mockup-sandbox`). 11 routes (wouter), no auth gate, base `/`.
- **Routes**: 11/11 pass headless crawl — all render real content (Mission Control, Widget Workflow, Habitat Projects, Materials Library, Design Toolkit, Moodboard Studio, Showcase, Settings, About) with **0 console errors, 0 page errors, 0 missing chunks**. `/dashboard` renders a graceful "Off the map, friend." fallback (catch-all) — not a crash.
- **Build**: `cd artifacts/solaraforge-web && pnpm build` passes (vite, 6.83s, dist/public + PWA service worker).
- **Verdict**: UI robust, no code fixes required. Any `/api/*` 500s are backend/Postgres down (not running locally) — environmental, not code bugs.