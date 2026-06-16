import { Router } from "express";
import { db } from "@workspace/db";
import { materialsTable } from "@workspace/db";
import { eq, lte, and } from "drizzle-orm";
import { GetMaterialParams, ListMaterialsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/materials/featured", async (_req, res) => {
  try {
    const materials = await db
      .select()
      .from(materialsTable)
      .where(eq(materialsTable.isFeatured, true));
    return res.json(materials);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch featured materials" });
  }
});

router.get("/materials", async (req, res) => {
  try {
    const params = ListMaterialsQueryParams.safeParse(req.query);
    const { category, maxCarbon } = params.success ? params.data : {};

    const conditions = [];
    if (category) conditions.push(eq(materialsTable.category, category));
    if (maxCarbon !== undefined) conditions.push(lte(materialsTable.embodiedCarbon, maxCarbon));

    const materials = await db
      .select()
      .from(materialsTable)
      .where(conditions.length ? and(...conditions) : undefined);
    return res.json(materials);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch materials" });
  }
});

router.get("/materials/:id", async (req, res) => {
  try {
    const { id } = GetMaterialParams.parse(req.params);
    const [material] = await db
      .select()
      .from(materialsTable)
      .where(eq(materialsTable.id, id));
    if (!material) return res.status(404).json({ error: "Material not found" });
    return res.json(material);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch material" });
  }
});

export default router;
