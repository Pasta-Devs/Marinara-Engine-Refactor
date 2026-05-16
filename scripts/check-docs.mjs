import { access, readFile } from "node:fs/promises";

const requiredDocs = [
  "RULES.md",
  "docs/tauri-refactor/README.md",
  "docs/tauri-refactor/00-source-inventory.md",
  "docs/tauri-refactor/01-target-structure.md",
  "docs/tauri-refactor/06-migration-plan.md",
  "docs/tauri-refactor/08-quality-rules.md",
];

await Promise.all(requiredDocs.map((path) => access(path)));

const migrationPlan = await readFile("docs/tauri-refactor/06-migration-plan.md", "utf8");
if (!migrationPlan.includes("## Phase 0: Baseline Structure")) {
  throw new Error("Migration plan is missing Phase 0 baseline structure.");
}

console.log(`Checked ${requiredDocs.length} refactor docs.`);
