import { pgTable, text, serial, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  biome: text("biome"),
  phase: text("phase").notNull().default("concept"),
  solarScore: real("solar_score"),
  embodiedCarbon: real("embodied_carbon"),
  waterHarvesting: real("water_harvesting"),
  estimatedCost: real("estimated_cost"),
  status: text("status").notNull().default("active"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const updateProjectSchema = insertProjectSchema.partial();
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
