import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const requiredDocs = [
  "AGENTS.md",
  "CONTRIBUTING.md",
  "README.md",
  ".github/pull_request_template.md",
  "package.json",
  "docs/developer/index.html",
  "docs/developer/getting-started.html",
  "docs/developer/run-build.html",
  "docs/developer/architecture.html",
  "docs/developer/modules.html",
  "docs/developer/impact-areas.html",
  "docs/developer/docs.css",
  "docs/developer/shared.js",
  "skills/marinara-architecture-guard/SKILL.md",
  "skills/marinara-mode-separation/SKILL.md",
  "skills/marinara-bugfix-discipline/SKILL.md",
  "skills/marinara-getting-started/SKILL.md",
];

await Promise.all(requiredDocs.map((path) => access(path)));

const htmlDocs = requiredDocs.filter((path) => path.endsWith(".html"));
const htmlByPath = new Map(
  await Promise.all(htmlDocs.map(async (path) => [path, await readFile(path, "utf8")])),
);

const expectedLinks = [
  "./index.html",
  "./getting-started.html",
  "./run-build.html",
  "./architecture.html",
  "./modules.html",
  "./impact-areas.html",
];

for (const [path, html] of htmlByPath) {
  for (const link of expectedLinks) {
    if (!html.includes(`href="${link}"`)) {
      throw new Error(`${path} is missing navigation link ${link}.`);
    }
  }

  const assetRefs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const ref of assetRefs) {
    if (
      ref.startsWith("http://") ||
      ref.startsWith("https://") ||
      ref.startsWith("#") ||
      ref.startsWith("mailto:")
    ) {
      continue;
    }

    const target = resolve(dirname(path), ref);
    await access(target);
  }
}

const allHtml = [...htmlByPath.values()].join("\n");
const mermaidBlocks = allHtml.match(/class="mermaid"/g)?.length ?? 0;
if (mermaidBlocks < 6) {
  throw new Error(`Expected at least 6 Mermaid diagrams, found ${mermaidBlocks}.`);
}

const runBuild = htmlByPath.get("docs/developer/run-build.html") ?? "";
for (const command of ["pnpm install", "pnpm tauri dev", "pnpm tauri build", "pnpm docs:dev"]) {
  if (!runBuild.includes(command)) {
    throw new Error(`Run/build docs are missing command: ${command}`);
  }
}

const agents = await readFile("AGENTS.md", "utf8");
if (!agents.includes("pnpm docs:dev") || !agents.includes("docs/developer/index.html")) {
  throw new Error("AGENTS.md must explain how to run the developer docs.");
}
if (
  !agents.includes("skills/marinara-getting-started/SKILL.md") ||
  !agents.includes("docs/developer/getting-started.html")
) {
  throw new Error("AGENTS.md must explain the getting-started agent workflow.");
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.scripts?.["docs:dev"] !== "vite docs/developer --host 127.0.0.1 --port 4174") {
  throw new Error("package.json must expose the expected pnpm docs:dev command.");
}
if (packageJson.scripts?.docs) {
  throw new Error("Do not add a docs script; pnpm docs collides with package documentation behavior.");
}

const contributing = await readFile("CONTRIBUTING.md", "utf8");
for (const expected of [
  "pnpm tauri dev",
  "pnpm check:architecture",
  "docs/developer/architecture.html",
  "docs/developer/modules.html",
  "docs/developer/impact-areas.html",
  "AI-Assisted Contribution Rules",
]) {
  if (!contributing.includes(expected)) {
    throw new Error(`CONTRIBUTING.md is missing expected guidance: ${expected}.`);
  }
}

for (const staleLegacyTerm of [
  "staging",
  "packages/client",
  "packages/server",
  "Fastify",
  "Docker / Podman",
]) {
  if (contributing.includes(staleLegacyTerm)) {
    throw new Error(`CONTRIBUTING.md contains legacy repo guidance: ${staleLegacyTerm}.`);
  }
}

const pullRequestTemplate = await readFile(".github/pull_request_template.md", "utf8");
for (const expected of ["Owner And Impact", "Architecture Notes", "pnpm check:architecture", "CONTRIBUTING.md"]) {
  if (!pullRequestTemplate.includes(expected)) {
    throw new Error(`Pull request template is missing expected guidance: ${expected}.`);
  }
}

console.log(`Checked ${requiredDocs.length} docs and repo guidance files.`);
