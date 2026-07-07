CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"biome" text,
	"phase" text DEFAULT 'concept' NOT NULL,
	"solar_score" real,
	"embodied_carbon" real,
	"water_harvesting" real,
	"estimated_cost" real,
	"status" text DEFAULT 'active' NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"embodied_carbon" real NOT NULL,
	"local_availability" text NOT NULL,
	"durability_years" integer NOT NULL,
	"recyclability" real NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"title" text NOT NULL,
	"biome" text,
	"summary" text,
	"palette" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"suggested_materials" jsonb DEFAULT '[]'::jsonb,
	"parametric_hints" jsonb,
	"estimated_carbon" real,
	"source_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_specs" ADD CONSTRAINT "design_specs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;