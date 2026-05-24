# Onboarding Flow

Use this reference for "how do I get started?" sessions.

## 1. Run The Docs

Start the static docs server:

```text
pnpm docs:dev
```

Give the user:

```text
http://127.0.0.1:4174/
```

If port `4174` is busy, use:

```text
pnpm exec vite docs/developer --host 127.0.0.1 --port <free-port>
```

## 2. Teach The Repo In One Pass

Explain this shape:

- `src/app`: React bootstrap, shell, providers, startup effects.
- `src/features`: user-facing React feature UI and hooks.
- `src/shared`: reusable frontend components, hooks, stores, and browser helpers.
- `src/shared/api`: typed Tauri adapters.
- `src/engine`: React-free product engine.
- `src/engine/capabilities`: ports passed into engine services and implemented at the feature/app edge.
- `src/engine/modes/chat`: normal chat and autonomous conversation.
- `src/engine/modes/roleplay`: roleplay scenes, encounters, and visual-novel behavior.
- `src/engine/modes/game`: game turns, prompts, mechanics, world, state, and assets.
- `src-tauri/src`: Tauri host and command registration.
- `src-tauri/crates`: Rust local capabilities.

## 3. Run The App

Use these commands from the repo root:

```text
pnpm install
pnpm tauri dev
```

Use checks as needed:

```text
pnpm typecheck
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm check:docs
```

## 4. First Manual Testing Pass

Test one workflow at a time and write down exact steps.

- Chat: create/select connection, create/select character/persona, send a message, regenerate, retry, swipe/branch, test attachments and summaries if available.
- Autonomous chat: enable/trigger autonomous behavior, observe schedule/status, verify persisted message changes.
- Roleplay: create/fork/conclude a scene, use choices, test scene memory, sprites, and roleplay encounter flow.
- Game: create game, start session, send a turn, retry, use dice/check/combat/map/journal/weather/time flows, test asset/music behavior.
- Settings/providers: create connection, test connection, send test message, verify provider-specific errors are visible.
- Imports/assets: import a character/lorebook/preset/persona, upload avatars/backgrounds/assets, export a current-format package.
- Integrations: test TTS, translation, Spotify, haptics only when credentials/devices are available.

## 5. Bug Report Shape

Ask the user to capture:

```text
Workflow:
Steps:
Expected:
Actual:
Mode or feature:
Data used:
Screenshot or console error:
```

Then map the bug to an owner:

- UI display/action issue: `src/features` or `src/shared/components`.
- Product behavior issue: `src/engine`, usually the owning mode or generation layer.
- Tauri boundary issue: `src/shared/api` plus matching command; engine code should receive a capability port, not import the adapter.
- Storage/assets/provider issue: `src-tauri` and Rust capability crates.

## 6. Fixing Mode

When the user gives a concrete bug:

1. Load `marinara-bugfix-discipline`.
2. Load `marinara-mode-separation` if the issue touches chat, roleplay, game, prompts, or generation.
3. State owner, impact area, likely files, and checks.
4. Fix the root cause.
5. Run targeted checks.
6. Final response must include behavior changed, files touched, impact reviewed, verification, and remaining risk.
