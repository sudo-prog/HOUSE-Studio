import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const execAsync = promisify(exec);
const router = Router();

const WEB_SRC = path.resolve(process.cwd(), "../../artifacts/solaraforge-web/src");
const WEB_DIR = path.resolve(process.cwd(), "../../artifacts/solaraforge-web");

router.get("/tools/ts-check", async (_req, res) => {
  try {
    let output = "";
    try {
      const result = await execAsync("npx tsc --noEmit 2>&1", {
        cwd: WEB_DIR,
        timeout: 30000,
      });
      output = result.stdout + result.stderr;
    } catch (err: any) {
      output = (err.stdout ?? "") + (err.stderr ?? "");
    }

    const lines = output.split("\n").filter(Boolean);
    const errors = lines
      .filter(l => /: error TS\d+/.test(l))
      .map(l => l.trim());
    const warnings = lines
      .filter(l => /: warning TS\d+/.test(l))
      .map(l => l.trim());

    return res.json({
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      clean: errors.length === 0,
      raw: output.slice(0, 5000),
    });
  } catch (err) {
    return res.status(500).json({ error: "TypeScript check failed", details: String(err) });
  }
});

router.post("/tools/apply-code", async (req, res) => {
  try {
    const { filePath, code } = req.body as { filePath?: string; code?: string };
    if (!filePath || typeof code !== "string") {
      return res.status(400).json({ error: "filePath and code are required" });
    }

    const normalized = filePath.replace(/^\/?(src\/)?/, "");
    const absPath = path.resolve(WEB_SRC, normalized);

    if (!absPath.startsWith(WEB_SRC)) {
      return res.status(403).json({ error: "File path must be inside src/" });
    }

    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, code, "utf-8");

    const relative = "src/" + normalized;
    return res.json({ success: true, appliedTo: relative });
  } catch (err) {
    return res.status(500).json({ error: "Failed to apply code", details: String(err) });
  }
});

export default router;
