import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeMoodboardBody } from "@workspace/api-zod";

const router = Router();

router.post("/moodboard/analyze", async (req, res) => {
  try {
    const parsed = AnalyzeMoodboardBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const { description, imageUrls } = parsed.data;

    const systemPrompt = `You are SolaraForge's habitat analysis AI. You analyze moodboard descriptions and generate structured "SolaraSpec" concept cards for solarpunk regenerative habitat designs.

Always respond with valid JSON matching this exact schema:
{
  "title": "string — evocative name for the concept",
  "biome": "string — e.g. 'Temperate Forest', 'Desert', 'Coastal', 'Mountain', 'Tropical'",
  "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "tags": ["string"],
  "summary": "string — 2-3 sentence description of the habitat concept",
  "suggestedMaterials": ["string"],
  "parametricHints": {
    "floorAreaSqm": number or null,
    "stories": integer or null,
    "roofType": "string or null",
    "primaryStructure": "string or null"
  },
  "estimatedCarbon": number
}`;

    const userContent = imageUrls?.length
      ? `Analyze this habitat inspiration: "${description}"\n\nImage references: ${imageUrls.join(", ")}`
      : `Analyze this habitat inspiration: "${description}"`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const spec = JSON.parse(raw);
    return res.json(spec);
  } catch (err) {
    console.error("Moodboard analyze error:", err);
    return res.status(500).json({ error: "Failed to analyze moodboard" });
  }
});

export default router;
