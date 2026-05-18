# Marinara Repo Layout

Use this as a quick map. The detailed source of truth for current maintenance docs is `docs/developer/architecture.html`, `docs/developer/modules.html`, and `docs/developer/impact-areas.html`.

## TypeScript

```text
src/app/
  React bootstrap, shell, providers, startup effects.

src/features/
  React feature UI, feature hooks, UI-only stores, feature API facades.

src/shared/
  Reusable frontend-only components, hooks, lib helpers, UI stores, and Tauri adapters.

src/shared/api/
  Typed wrappers around Tauri commands and channels. Feature code may call these. Engine code may not.

src/engine/
  React-free product engine. Owns domain rules and orchestration.
```

## Engine Layers

```text
engine/contracts       Layer 0: types, schemas, constants
engine/core            Layer 0: result, IDs, clock, JSON primitives
engine/capabilities    Layer 1: TypeScript ports for Rust capabilities
engine/shared          Layer 2: pure deterministic helpers
engine/entities        Layer 3: pure entity operations
engine/repositories    Layer 4: capability-backed repositories
engine/generation-core Layer 5: prompt, lorebook, regex, LLM message building blocks
engine/agents-runtime  Layer 6: agent executor, tools, knowledge, memory
engine/generation      Layer 7: generation lifecycle and persistence
engine/modes           Layer 8: chat, roleplay, game top-level mode engines
```

Higher layers may import lower layers. Lower layers may not import higher layers.

## Rust

```text
src-tauri/src/
  lib.rs, state, app setup, command facades.

src-tauri/src/commands/
  Thin Tauri command modules grouped by capability.

src-tauri/crates/core/
  errors, IDs, paths, timestamps, basic foundations.

src-tauri/crates/security/
  path safety, outbound policy, secrets, safe fetch guards.

src-tauri/crates/storage/
  raw local storage, atomic writes, manifests, repositories.

src-tauri/crates/assets/
  managed media and file/blob handling.

src-tauri/crates/llm/
  provider transport, streaming, request shaping requiring secrets/network.

src-tauri/crates/integrations/
  Spotify, TTS, translation, haptics, and external integration transport.
```

Rust owns capability execution. TypeScript owns product meaning.

## UI Features

Important feature owners:

- `features/chats`: normal chat UI and shared chat/message components.
- `features/roleplay`: roleplay UI surfaces and roleplay-only panels.
- `features/game`: game UI surfaces, game hooks, game stores, and game feature API.
- `features/visuals`: shared visual components only when multiple features need visual primitives.
- `features/agents`, `features/characters`, `features/personas`, `features/lorebooks`, `features/presets`, `features/connections`, `features/settings`: feature-owned UI and hooks.

Shared UI belongs in `src/shared/components` only when it is genuinely generic.
