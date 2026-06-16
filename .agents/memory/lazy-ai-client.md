---
name: Lazy AI client pattern
description: OpenAI client must be initialized lazily; eager validation at module load crashes the server if env vars aren't set
---

The template AI client files (`lib/integrations-openai-ai-server/src/client.ts` and `image/client.ts`) throw immediately at import time if `OPENAI_BASE_URL` / `OPENAI_API_KEY` aren't set. This crashes the entire API server on startup even when no AI endpoint has been called yet.

**Why:** Users often set up the app before they have credentials — the server must be able to boot and serve non-AI routes.

**How to apply:** Replace the eager validation pattern with a JS `Proxy` or lazy getter factory:
```ts
let _client: OpenAI | null = null;
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!_client) {
      const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
      const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      if (!baseURL || !apiKey) throw new Error("AI credentials not configured.");
      _client = new OpenAI({ apiKey, baseURL });
    }
    return (_client as any)[prop];
  },
});
```
This defers the credential check to the first actual AI call, not import time.
