---
name: DB template table names
description: Template conversations/messages schema files export with short names, not *Table suffix
---

The template schema files at `lib/db/src/schema/conversations.ts` and `lib/db/src/schema/messages.ts` export their tables as `conversations` and `messages` — NOT `conversationsTable` and `messagesTable`.

**Why:** The template was scaffolded before the project adopted the *Table naming convention used in custom schemas (e.g. `projectsTable`, `materialsTable`).

**How to apply:** When importing in API routes, alias them explicitly:
```ts
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
```
Or just use the short names `conversations` and `messages` directly.
