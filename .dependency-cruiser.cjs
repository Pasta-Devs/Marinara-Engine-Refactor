const { readdirSync } = require("node:fs");
const { join } = require("node:path");

const featureNames = readdirSync(join(__dirname, "src/features"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const crossFeaturePrivateRules = featureNames.flatMap((featureName) => {
  const escapedFeatureName = escapeRegExp(featureName);
  const outsideFeaturePath = `^src/(app|shared|engine|features/(?!${escapedFeatureName}/))`;
  const privateFeaturePath = `^src/features/${escapedFeatureName}/(components|hooks|stores|state)/`;

  return [
    {
      name: `no-cross-feature-private-imports-${featureName}`,
      severity: "error",
      comment:
        "Feature internals are private to their owning feature. Cross-feature callers must use an explicit public API.",
      from: { path: outsideFeaturePath },
      to: { path: privateFeaturePath },
    },
  ];
});

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Modules should remain acyclic so ownership and initialization order stay understandable.",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "shared-must-not-import-features",
      severity: "error",
      comment: "Shared code is a lower layer and cannot depend on feature implementations.",
      from: { path: "^src/shared/" },
      to: { path: "^src/features/" },
    },
    {
      name: "shared-must-not-import-app",
      severity: "error",
      comment: "Shared code must not depend on app composition code.",
      from: { path: "^src/shared/" },
      to: { path: "^src/app/" },
    },
    {
      name: "engine-must-not-import-tauri-adapters",
      severity: "error",
      comment: "Engine code talks to capability interfaces, not concrete Tauri adapters.",
      from: { path: "^src/engine/" },
      to: { path: "^src/shared/api/" },
    },
    {
      name: "engine-must-not-import-tauri-runtime",
      severity: "error",
      comment: "Tauri runtime calls belong in shared API adapters and Rust commands.",
      from: { path: "^src/engine/" },
      to: { path: "^node_modules/@tauri-apps/api/" },
    },
    {
      name: "engine-must-not-import-react",
      severity: "error",
      comment: "Engine code is product logic and must stay UI-framework independent.",
      from: { path: "^src/engine/" },
      to: { path: "^node_modules/(react|react-dom)/" },
    },
    {
      name: "engine-must-not-import-zustand",
      severity: "error",
      comment: "Engine code must not depend on concrete UI stores.",
      from: { path: "^src/engine/" },
      to: { path: "^node_modules/zustand/" },
    },
    {
      name: "chat-mode-must-not-import-roleplay-or-game",
      severity: "error",
      comment: "Top-level modes are separate product paths.",
      from: { path: "^src/engine/modes/chat/" },
      to: { path: "^src/engine/modes/(roleplay|game)/" },
    },
    {
      name: "roleplay-mode-must-not-import-chat-or-game",
      severity: "error",
      comment: "Top-level modes are separate product paths.",
      from: { path: "^src/engine/modes/roleplay/" },
      to: { path: "^src/engine/modes/(chat|game)/" },
    },
    {
      name: "game-mode-must-not-import-chat-or-roleplay",
      severity: "error",
      comment: "Top-level modes are separate product paths.",
      from: { path: "^src/engine/modes/game/" },
      to: { path: "^src/engine/modes/(chat|roleplay)/" },
    },
    ...crossFeaturePrivateRules,
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsConfig: {
      fileName: "tsconfig.json",
    },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    exclude: {
      path: "(^dist/|^node_modules/|\\.d\\.ts$)",
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};
