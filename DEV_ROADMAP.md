# Dev Roadmap — SolaraForge (HOUSE_STUDIO)

## Phase 1: Foundation ✅
- [x] pnpm monorepo scaffold with security hardening
- [x] PostgreSQL + Drizzle ORM schema (5 tables)
- [x] Express API server (CORS, pino logging, JSON parsing)
- [x] OpenAI integration (client wrapper, system prompt)
- [x] Full REST API (projects, materials, moodboard, openai, tools)
- [x] Zod validation schemas (generated from Drizzle)
- [x] React Query API client (generated from OpenAPI)
- [x] React/Vite frontend scaffold (11 pages)
- [x] Wouter routing, Command palette, Keyboard shortcuts
- [x] Dark/light/system theme with localStorage
- [x] PWA service worker
- [x] Tailwind CSS v4 + shadcn-style UI library
- [x] Framer-motion + Lucide icons
- [x] Mockup sandbox

## Phase 2: Frontend-Backend Integration
- [ ] Wire API client hooks to all frontend pages
- [ ] Project CRUD: create, edit, delete, detail view
- [ ] Materials library: browse, filter, detail
- [ ] Moodboard: image upload → AI analysis → design spec display
- [ ] AI chat: conversation list, message history, streaming responses
- [ ] Error handling (API errors, network failures, loading states)
- [ ] Toast notifications for CRUD operations

## Phase 3: Core Features
- [ ] Project creation wizard (biome selection, goals, constraints)
- [ ] Studio page: visual habitat design workspace
- [ ] Design spec viewer/editor
- [ ] Materials recommender (suggest materials based on project biome)
- [ ] Workflow page: step-by-step habitat design process
- [ ] Tools page: palette generator, TS checker

## Phase 4: AI Features
- [ ] Moodboard analysis with image understanding
- [ ] AI design suggestions based on project parameters
- [ ] Material sustainability scoring
- [ ] Carbon footprint estimation
- [ ] Phased construction planning

## Phase 5: Polish & Deploy
- [ ] Authentication (login, session management)
- [ ] Database migrations (generate + run)
- [ ] E2E tests
- [ ] Performance optimization (bundle splitting, lazy loading)
- [ ] Deployment pipeline (Docker, CI/CD)
- [ ] Domain + SSL setup
