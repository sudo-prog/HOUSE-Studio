---
name: SolaraForge AI system
description: AI Collaborator features, API routes, code conventions for the chat/memory/generator system.
---

## Component location
- `artifacts/solaraforge-web/src/components/ai/AICollaborator.tsx` (standalone, imported into ProjectDetail)

## API routes (artifacts/api-server/src/routes/tools.ts)
- `GET /api/tools/ts-check` — runs `npx tsc --noEmit` in solaraforge-web, returns `{ errorCount, warningCount, errors[], clean, raw }`
- `POST /api/tools/apply-code` — body `{ filePath, code }`, writes to solaraforge-web/src/ only (path traversal protected)

## System prompt enrichment (openai.ts)
- `projectContext` field in message body → injected as "## Current Project" section
- `projectMemory` field in message body → injected as "## Project Memory" section
- Code generation rules appended: AI must start every code block with `// filepath: src/...`

## Memory convention
- Per-project localStorage key: `ai-memory-${projectId}`
- AI can auto-update memory by including `[REMEMBER: fact]` in its response
- User can edit memory directly in the collapsible Memory panel

## Code block Apply convention
- First line of code block must be `// filepath: src/components/foo/Bar.tsx`
- Apply button calls `POST /api/tools/apply-code` with the extracted path and code body
- Copy button always available regardless of filepath

**Why:** These conventions let the AI generate code that users can apply to the project with one click — core to the "AI generates components from scratch" feature.
