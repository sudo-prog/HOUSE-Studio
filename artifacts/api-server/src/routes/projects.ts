import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db";
import { eq, desc, avg, count, sum } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/stats", async (_req, res) => {
  try {
    const [totals] = await db
      .select({
        totalProjects: count(projectsTable.id),
        avgSolarScore: avg(projectsTable.solarScore),
        totalCarbonSaved: sum(projectsTable.embodiedCarbon),
      })
      .from(projectsTable);

    const activeResult = await db
      .select({ count: count(projectsTable.id) })
      .from(projectsTable)
      .where(eq(projectsTable.status, "active"));

    const recentProjects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt))
      .limit(3);

    return res.json({
      totalProjects: Number(totals.totalProjects ?? 0),
      activeProjects: Number(activeResult[0]?.count ?? 0),
      totalCarbonSaved: Number(totals.totalCarbonSaved ?? 0),
      avgSolarScore: Number(totals.avgSolarScore ?? 0),
      recentProjects,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/projects", async (_req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt));
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const [project] = await db
      .insert(projectsTable)
      .values(parsed.data)
      .returning();
    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse(req.params);
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse(req.params);
    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const [project] = await db
      .update(projectsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projectsTable.id, id))
      .returning();
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = DeleteProjectParams.parse(req.params);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
