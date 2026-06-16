import { pgTable, text, serial, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  embodiedCarbon: real("embodied_carbon").notNull(),
  localAvailability: text("local_availability").notNull(),
  durabilityYears: integer("durability_years").notNull(),
  recyclability: real("recyclability").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
  imageUrl: text("image_url"),
});

export const insertMaterialSchema = createInsertSchema(materialsTable).omit({ id: true });
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materialsTable.$inferSelect;
