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
- `lib/db/` — Shared database schema (Drizzle), migrations
- `lib/api-zod/` — Shared Zod schemas, API client
- `lib/api-client-react/` — Generated API client for frontend
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

### Known Issues
- AI requires `OPENAI_API_KEY` environment variable
- PostgreSQL required for conversation history
- No explicit mobile app (web app is responsive)

---

## Deployment Checklist
- [ ] Set environment variables in deployment platform
- [ ] Apply database migrations (`pnpm db:push` or direct SQL)
- [ ] Configure `VITE_API_BASE_URL` in Vercel dashboard to point to API server
- [ ] Configure `OPENAI_API_KEY` for AI functionality
- [ ] Set up PWA offline support if needed