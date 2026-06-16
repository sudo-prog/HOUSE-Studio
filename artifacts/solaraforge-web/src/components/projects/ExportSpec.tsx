import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description?: string | null;
  biome?: string | null;
  phase?: string | null;
  solarScore?: number | null;
  embodiedCarbon?: number | null;
  waterHarvesting?: number | null;
  estimatedCost?: number | null;
  createdAt?: string | null;
}

export function ExportSpecButton({ project }: { project: Project }) {
  const handleExport = () => {
    const now = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
    const carbon = project.embodiedCarbon ?? 0;
    const carbonStr = carbon < 0
      ? `Carbon Negative: sequesters ${Math.abs(carbon).toLocaleString()} kg CO₂e`
      : `Embodied Carbon: ${carbon.toLocaleString()} kg CO₂e`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SolaraSpec — ${project.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f5f0e8; color: #1a1a1a; padding: 40px; max-width: 860px; margin: 0 auto; }
  .header { background: #1a3a2a; color: white; border-radius: 16px; padding: 36px 40px; margin-bottom: 28px; position: relative; overflow: hidden; }
  .header::after { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; background: rgba(232,160,32,0.2); border-radius: 50%; }
  .logo { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
  .project-name { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; line-height: 1.2; color: white; }
  .badges { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge-biome { background: rgba(255,255,255,0.15); color: white; }
  .badge-phase { background: #e8a020; color: #1a1a1a; text-transform: capitalize; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .metric-card { background: white; border-radius: 14px; padding: 20px 24px; border: 1px solid #e0d9ce; }
  .metric-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #7a6e5e; margin-bottom: 6px; }
  .metric-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1a3a2a; }
  .metric-sub { font-size: 11px; color: #9e8e78; margin-top: 3px; }
  .section { background: white; border-radius: 14px; padding: 24px 28px; border: 1px solid #e0d9ce; margin-bottom: 16px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #1a3a2a; margin-bottom: 12px; }
  .description { font-size: 14px; line-height: 1.75; color: #4a4035; }
  .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #9e8e78; }
  .carbon-neg { color: #16a34a; }
  .carbon-pos { color: #d97706; }
  @media print {
    body { padding: 0; background: white; }
    .header { border-radius: 0; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">SolaraForge · Project Specification</div>
    <div class="project-name">${project.name}</div>
    <div class="badges">
      ${project.biome ? `<span class="badge badge-biome">${project.biome}</span>` : ''}
      ${project.phase ? `<span class="badge badge-phase">${project.phase}</span>` : ''}
    </div>
  </div>

  <div class="grid">
    <div class="metric-card">
      <div class="metric-label">☀ Solar Score</div>
      <div class="metric-value">${project.solarScore ?? 0}%</div>
      <div class="metric-sub">Passive solar efficiency</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">🌿 Embodied Carbon</div>
      <div class="metric-value ${carbon < 0 ? 'carbon-neg' : 'carbon-pos'}">${carbon < 0 ? '−' : '+'}${Math.abs(carbon).toLocaleString()} kg</div>
      <div class="metric-sub">CO₂e net lifecycle</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">💧 Water Harvesting</div>
      <div class="metric-value">${(project.waterHarvesting ?? 0).toLocaleString()} L</div>
      <div class="metric-sub">Estimated annual capacity</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">💰 Estimated Cost</div>
      <div class="metric-value">$${(project.estimatedCost ?? 0).toLocaleString()}</div>
      <div class="metric-sub">Indicative all-in budget</div>
    </div>
  </div>

  ${project.description ? `
  <div class="section">
    <div class="section-title">Project Vision</div>
    <p class="description">${project.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Carbon Statement</div>
    <p class="description">${carbonStr}. ${
      carbon < 0
        ? `This project is carbon-negative — it will sequester more CO₂ than is emitted in its construction and operation. This qualifies it as a regenerative building under the Living Building Challenge framework.`
        : `Steps to reduce embodied carbon: switch wall system to hempcrete or straw bale, specify reclaimed timber structure, and source materials within 50 km of site.`
    }</p>
  </div>

  <div class="footer">
    Generated by SolaraForge · ${now} · solaraforge.app<br>
    This document is conceptual. Always validate with qualified architects and engineers before construction.
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <Button variant="outline" className="border-border/50 gap-2" onClick={handleExport}>
      <FileDown className="h-4 w-4" /> Export Spec
    </Button>
  );
}
