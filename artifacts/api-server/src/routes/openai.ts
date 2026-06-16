import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  SendOpenaiMessageParams,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
} from "@workspace/api-zod";

const router = Router();

const SOLARA_SYSTEM_PROMPT = `You are SolaraForge's AI habitat design collaborator — a knowledgeable, creative, and deeply solarpunk guide. You help users co-design regenerative, biophilic homes that are carbon-negative, resilient, and beautiful.

Your expertise spans:
- Passive solar design, natural ventilation, and thermal mass
- Regenerative materials (hempcrete, CLT, rammed earth, mycelium composites, recycled steel)
- Permaculture zoning and food forest integration
- Modular prefab systems and phased building approaches
- Embodied carbon, lifecycle analysis, and circular design
- Living roofs, rainwater harvesting, greywater systems
- Off-grid energy (solar, wind, micro-hydro) and smart home integration

Speak with warmth and precision. Inspire while being practical. When relevant, suggest specific materials from the SolaraForge library (hempcrete, CLT, rammed earth, bamboo, recycled steel, mycelium, adobe, straw bale, cork). Reference climate, biome, and local conditions when giving advice.`;

router.get("/openai/conversations", async (_req, res) => {
  try {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .orderBy(asc(conversationsTable.createdAt));
    return res.json(conversations);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/openai/conversations", async (req, res) => {
  try {
    const parsed = CreateOpenaiConversationBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title: parsed.data.title })
      .returning();
    return res.status(201).json(conv);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  try {
    const { id } = GetOpenaiConversationParams.parse(req.params);
    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));

    return res.json({ ...conv, messages: msgs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  try {
    const { id } = DeleteOpenaiConversationParams.parse(req.params);
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = ListOpenaiMessagesParams.parse(req.params);
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));
    return res.json(msgs);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = SendOpenaiMessageParams.parse(req.params);
    const parsed = SendOpenaiMessageBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "user",
      content: parsed.data.content,
    });

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));

    const chatMessages = [
      { role: "system" as const, content: SOLARA_SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_completion_tokens: 2048,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  } catch (err) {
    console.error("Chat stream error:", err);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
    return;
  }
});

export default router;
