import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const designSpecsTable = pgTable("design_specs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  biome: text("biome"),
  summary: text("summary"),
  palette: jsonb("palette").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  suggestedMaterials: jsonb("suggested_materials").$type<string[]>().default([]),
  parametricHints: jsonb("parametric_hints").$type<{
    floorAreaSqm: number | null;
    stories: number | null;
    roofType: string | null;
    primaryStructure: string | null;
  }>(),
  estimatedCarbon: real("estimated_carbon"),
  sourceDescription: text("source_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDesignSpecSchema = createInsertSchema(designSpecsTable).omit({
  id: true,
  createdAt: true,
});

export type DesignSpec = typeof designSpecsTable.$inferSelect;
export type InsertDesignSpec = z.infer<typeof insertDesignSpecSchema>;
