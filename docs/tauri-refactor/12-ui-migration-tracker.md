# UI Migration Tracker

Use this tracker for the copy-first UI migration pass. The goal is to move the original React UI from `E:/Personal Projects/Marinara-Engine/packages/client/src` into the refactor structure with minimal edits: import paths, ownership folders, and compile-only seams.

Rules for this pass:

- Copy original UI code; do not simplify or redesign it.
- Backend calls may fail through existing unavailable API seams.
- Do not add fake persistence, mock data, preview routes, or visible placeholder UI.
- If a migrated route depends on an unmigrated future surface, prefer an internal `null`/unavailable seam until the original surface is copied.
- Keep adapters thin and obvious when the target app shell needs to bridge existing store state into moved original components.

## Current Remaining UI Groups

| Original source group | Target owner | Status | Notes |
| --- | --- | --- | --- |
| `components/agents/*` | `src/features/agents/components` | Moved | Includes editors, debug panels, tool/regex UI, `AgentsPanel`, and `EditAgentModal`; backend/tool actions remain unavailable through API seams. |
| `components/bot-browser/*` | `src/features/bot-browser/components` | Moved | Includes browser view, panel, and modal UI; network/import behavior remains backend-deferred. |
| `components/characters/CharacterEditor.tsx` | `src/features/characters/components` | Moved | Full editor is restored in the shell route. |
| `components/connections/ConnectionEditor.tsx` | `src/features/connections/components` | Moved | Full editor is restored; provider/model operations remain backend-deferred. |
| `components/diagnostics/*` | `src/features/diagnostics/components` | Moved | Diagnostics banner copied for shell/app use. |
| `components/game-assets/*` | `src/features/game-assets/components` | Moved | Full asset browser tree copied; filesystem calls remain unavailable. |
| `components/layout/TrackerDataSidebar.tsx` and `components/layout/tracker-data-sidebar/*` | `src/features/tracker/components` | Moved | Tracker sidebar UI is wired through the moved original `AppShell`. |
| `components/modals/*` | owning feature component folders | Moved | All 17 original modal bodies are copied and the moved original `ModalRenderer` switch is restored. |
| `components/onboarding/*` | `src/features/onboarding/components` | Moved | Tutorial UI is wired through the moved original shell route. |
| `components/personas/PersonaEditor.tsx` | `src/features/personas/components` | Moved | Full editor is restored in the shell route. |
| `components/spotify/*` | `src/features/spotify/components` | Moved | Mini player widgets copied; playback/backend calls may fail silently. |
| remaining `components/ui/*` | `src/shared/components/ui` | Moved | All original UI primitives are present by filename. |
| remaining `hooks/*` | owning feature/shared hook folders | Moved | All 33 original hook files are represented; backend behavior remains unavailable where Rust slices do not exist. |
| remaining `lib/*` | owning feature/shared lib folders | Moved | All 36 original client lib files are represented by filename under feature or shared ownership. |

## Completed In Prior Cleanup

- Chat, roleplay, game, settings, lorebooks, presets, connections read panel, character/persona library panels, `ChatSidebar`, `RightPanel`, `CustomThemeInjector`, `use-chat-folders`, and `use-extensions` were already reworked from simplified replacements into moved original UI or thin adapters.

## 2026-05-17 Full UI Copy Pass

- Replaced the adapted shell with moved original `AppShell`, `TopBar`, `RightPanel`, and `ModalRenderer`, with imports pointed at the reorganized feature/shared folders.
- Restored center-shell detail routes for character, persona, connection, agent, tool, regex script, bot browser, game assets, tracker sidebar, onboarding, chat notifications, and Spotify widgets.
- Copied all remaining original UI component groups, modal bodies, frontend hooks, and client libs into the target structure.
- Added only compile-level unavailable seams for streaming API methods. No fake streaming, fake persistence, mock data, or visible placeholder UI was added.
- Verification checkpoint: `pnpm check:frontend` passed after this pass.

## 2026-05-17 Asset Copy Pass

- Refreshed `packages/client/public` into root `public`, preserving favicon, app icons, logo assets, manifest, NPC silhouette, and bundled Mari/Dottore sprites.
- Copied server-provided default/media assets from `packages/server/data` into `src-tauri/resources/default-data`:
  - `backgrounds`
  - `db/default-preset.json`
  - `fonts`
  - `game-assets`
  - `knowledge-sources`
  - `models`
  - `sidecar-runtime`
  - `sprites`
- Copied platform icon assets from `android/app/src/main/res/mipmap-*` and `win/installer/app-icon.ico` into `src-tauri/resources/platform-assets`; also replaced the active Tauri Windows `.ico` with the original Windows app icon.
- Added `src-tauri/tauri.conf.json` bundle resources entries for `resources/default-data/**/*` and `resources/platform-assets/**/*`.
- Intentionally did not copy runtime user data/secrets from `packages/server/data`: `.encryption-key`, `marinara-engine.db`, `marinara-engine.db-shm`, or `marinara-engine.db-wal`.
- No Rust asset service, seeding, file serving, or migration code was implemented in this pass.
