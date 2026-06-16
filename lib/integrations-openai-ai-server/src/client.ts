import OpenAI from "openai";

let _client: OpenAI | null = null;

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!_client) {
      const baseURL =
        process.env.OPENAI_BASE_URL ||
        process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
      const apiKey =
        process.env.OPENAI_API_KEY ||
        process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

      if (!baseURL || !apiKey) {
        throw new Error(
          "AI credentials not configured. Set OPENAI_BASE_URL and OPENAI_API_KEY. For local LLMs (Ollama), use e.g. http://localhost:11434/v1 and 'ollama' as key.",
        );
      }
      _client = new OpenAI({ apiKey, baseURL });
    }
    return (_client as Record<string | symbol, unknown>)[prop];
  },
});
