import { Router } from "express";
import multer from "multer";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeMoodboardBody } from "@workspace/api-zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/moodboard/analyze", upload.array("images", 10), async (req, res) => {
  try {
    const body = req.is("multipart/form-data")
      ? { description: req.body.description, imageUrls: req.body.imageUrls ? JSON.parse(req.body.imageUrls) : [] }
      : req.body;

    const parsed = AnalyzeMoodboardBody.safeParse(body);
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

    const uploadedFiles = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (uploadedFiles.length > 0) {
      const contentParts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "low" } }> = [
        { type: "text", text: `Analyze this habitat inspiration: "${description}"${imageUrls?.length ? `\n\nAdditional image URLs: ${imageUrls.join(", ")}` : ""}` },
        ...uploadedFiles.map(file => ({
          type: "image_url" as const,
          image_url: {
            url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            detail: "low" as const,
          },
        })),
      ];

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        max_completion_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contentParts },
        ],
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      return res.json(JSON.parse(raw));
    }

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
    return res.json(JSON.parse(raw));
  } catch (err) {
    console.error("Moodboard analyze error:", err);
    return res.status(500).json({ error: "Failed to analyze moodboard" });
  }
});

export default router;
