/**
 * Seed script: populates the materials library with 22 regenerative building materials.
 * Run with: pnpm --filter @workspace/db run seed
 */
import { db } from "./index";
import { materialsTable } from "./schema";

const materials = [
  { name: "Hempcrete", category: "Wall Systems", description: "A biocomposite of hemp hurds and lime. Carbon-negative over its lifetime, excellent thermal mass, breathable, and pest-resistant.", embodiedCarbon: -35.0, localAvailability: "Regional", durabilityYears: 100, recyclability: 95, isFeatured: true, tags: ["carbon-negative","breathable","thermal-mass","natural"] },
  { name: "Cross-Laminated Timber (CLT)", category: "Structure", description: "Mass timber panels with alternating wood grain layers. Strong as concrete, sequesters carbon, fast to install, and beautiful exposed.", embodiedCarbon: 28.0, localAvailability: "Wide", durabilityYears: 80, recyclability: 85, isFeatured: true, tags: ["timber","structural","low-carbon","prefab"] },
  { name: "Rammed Earth", category: "Wall Systems", description: "Compacted layers of subsoil, chalk, lime, and gravel. Exceptional thermal mass, zero transport cost if local, monolithic beauty.", embodiedCarbon: 5.0, localAvailability: "Local", durabilityYears: 200, recyclability: 100, isFeatured: true, tags: ["earthen","thermal-mass","zero-waste","vernacular"] },
  { name: "Recycled Steel", category: "Structure", description: "Post-industrial steel with 75-90% recycled content. Strong, durable, fully recyclable at end of life, ideal for modular container builds.", embodiedCarbon: 45.0, localAvailability: "Wide", durabilityYears: 100, recyclability: 100, isFeatured: true, tags: ["recycled","structural","modular","container"] },
  { name: "Straw Bale", category: "Insulation", description: "Agricultural byproduct walls with R-30+ insulation. Hyperlocal, carbon-sequestering, fire-resistant when plastered, ancient and proven.", embodiedCarbon: -15.0, localAvailability: "Local", durabilityYears: 75, recyclability: 90, isFeatured: false, tags: ["carbon-negative","insulation","agricultural","natural"] },
  { name: "Bamboo", category: "Structure", description: "The fastest-growing structural material on Earth. Tensile strength rivaling steel, sequesters CO2 rapidly, beautiful and flexible.", embodiedCarbon: -20.0, localAvailability: "Regional", durabilityYears: 50, recyclability: 80, isFeatured: true, tags: ["fast-growing","structural","tropical","natural"] },
  { name: "Cork", category: "Insulation", description: "Harvested without cutting trees, cork is fire-resistant, moisture-resistant, and an excellent acoustic and thermal insulator.", embodiedCarbon: -110.0, localAvailability: "Regional", durabilityYears: 50, recyclability: 75, isFeatured: false, tags: ["carbon-negative","acoustic","moisture-resistant","harvested"] },
  { name: "Mycelium Composite", category: "Insulation", description: "Fungi-grown insulation panels using agricultural waste. Compostable, zero-VOC, fire-resistant, and grown in days rather than manufactured.", embodiedCarbon: -5.0, localAvailability: "Emerging", durabilityYears: 25, recyclability: 100, isFeatured: true, tags: ["biofabricated","compostable","innovative","insulation"] },
  { name: "Earthbag", category: "Wall Systems", description: "Polypropylene bags filled with local subsoil or sand. Seismically resilient, flood-resistant, ultra-low-cost, and community-buildable.", embodiedCarbon: 8.0, localAvailability: "Local", durabilityYears: 100, recyclability: 40, isFeatured: false, tags: ["earthen","seismic","DIY","low-cost"] },
  { name: "Reclaimed Timber", category: "Structure", description: "Salvaged old-growth wood with embodied history and character. Near-zero carbon footprint, often stronger than new-cut lumber.", embodiedCarbon: 2.0, localAvailability: "Local", durabilityYears: 100, recyclability: 90, isFeatured: true, tags: ["reclaimed","circular","character","zero-waste"] },
  { name: "Adobe (Sun-dried Brick)", category: "Wall Systems", description: "Clay, sand, and straw mixed and sun-dried. Zero-energy production, excellent thermal mass, fully biodegradable, 5000 years proven.", embodiedCarbon: 3.0, localAvailability: "Local", durabilityYears: 80, recyclability: 100, isFeatured: false, tags: ["earthen","vernacular","thermal-mass","DIY"] },
  { name: "Recycled Glass Aggregate", category: "Finishes", description: "Crushed post-consumer glass used in concrete, terrazzo floors, and countertops. Diverts waste, beautiful sparkle, durable finish.", embodiedCarbon: 12.0, localAvailability: "Wide", durabilityYears: 50, recyclability: 100, isFeatured: false, tags: ["recycled","circular","decorative","concrete"] },
  { name: "Lime Plaster", category: "Finishes", description: "Natural lime-based wall finish. Breathable, anti-bacterial, self-healing hairline cracks, and carbon-sequestering as it re-carbonates.", embodiedCarbon: 15.0, localAvailability: "Wide", durabilityYears: 50, recyclability: 95, isFeatured: false, tags: ["breathable","natural","finish","carbon-absorbing"] },
  { name: "Compressed Earth Block (CEB)", category: "Wall Systems", description: "Machine-compressed earth blocks for precise modular construction. Higher strength than adobe, minimal energy to produce.", embodiedCarbon: 6.0, localAvailability: "Local", durabilityYears: 100, recyclability: 100, isFeatured: false, tags: ["earthen","modular","precise","low-energy"] },
  { name: "Sheep's Wool Insulation", category: "Insulation", description: "Natural protein-fiber insulation that absorbs and releases moisture without losing thermal performance. Renewable, compostable.", embodiedCarbon: 5.5, localAvailability: "Regional", durabilityYears: 50, recyclability: 90, isFeatured: false, tags: ["natural","breathable","moisture-buffering","animal"] },
  { name: "Polished Concrete (Recycled)", category: "Flooring", description: "Concrete with 30-50% recycled content (fly ash, slag) polished to a smooth finish. Durable thermal mass floor, no added coatings.", embodiedCarbon: 90.0, localAvailability: "Wide", durabilityYears: 100, recyclability: 30, isFeatured: false, tags: ["thermal-mass","recycled-content","flooring","industrial"] },
  { name: "Living Roof Substrate", category: "Roofing", description: "Engineered growing medium for sedum or meadow living roofs. Insulates, manages stormwater, boosts biodiversity, cools urban heat.", embodiedCarbon: 10.0, localAvailability: "Wide", durabilityYears: 40, recyclability: 80, isFeatured: true, tags: ["living-roof","biodiversity","stormwater","cooling"] },
  { name: "Recycled PET Insulation", category: "Insulation", description: "Insulation batts made from post-consumer plastic bottles. Diverts plastic waste, non-toxic to handle, good acoustic performance.", embodiedCarbon: 25.0, localAvailability: "Wide", durabilityYears: 50, recyclability: 50, isFeatured: false, tags: ["recycled-plastic","circular","non-toxic","acoustic"] },
  { name: "Flax/Linen Insulation", category: "Insulation", description: "Natural plant-fiber insulation from flax crop residue. Carbon-negative, non-irritating to install, fully compostable at end of life.", embodiedCarbon: -12.0, localAvailability: "Regional", durabilityYears: 50, recyclability: 100, isFeatured: false, tags: ["natural","carbon-negative","compostable","crop-residue"] },
  { name: "Timber Frame (FSC Certified)", category: "Structure", description: "Traditional post-and-beam structure from responsibly certified forests. Low-carbon, highly adaptable, and repairable for generations.", embodiedCarbon: 35.0, localAvailability: "Wide", durabilityYears: 100, recyclability: 85, isFeatured: true, tags: ["timber","certified","traditional","adaptable"] },
  { name: "3D-Printed Earth", category: "Structure", description: "CNC-extruded local clay and soil mixtures for freeform walls. Eliminates formwork, minimal waste, custom biomorphic geometries.", embodiedCarbon: 8.0, localAvailability: "Emerging", durabilityYears: 80, recyclability: 90, isFeatured: true, tags: ["innovative","earthen","additive","digital-fabrication"] },
  { name: "Cob", category: "Wall Systems", description: "Hand-sculpted earth, sand, and straw mixture. Entirely tool-free construction, sculptural, monolithic, and thermally excellent.", embodiedCarbon: 2.0, localAvailability: "Local", durabilityYears: 150, recyclability: 100, isFeatured: false, tags: ["earthen","sculpted","DIY","monolithic"] },
] as const;

async function seed() {
  console.log("Seeding materials library...");
  for (const m of materials) {
    await db
      .insert(materialsTable)
      .values({
        name: m.name,
        category: m.category,
        description: m.description,
        embodiedCarbon: m.embodiedCarbon,
        localAvailability: m.localAvailability,
        durabilityYears: m.durabilityYears,
        recyclability: m.recyclability,
        isFeatured: m.isFeatured,
        tags: m.tags as unknown as string[],
        imageUrl: null,
      })
      .onConflictDoNothing();
  }
  console.log(`✓ Seeded ${materials.length} materials`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
