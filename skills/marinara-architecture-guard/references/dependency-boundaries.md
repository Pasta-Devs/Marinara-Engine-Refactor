# Dependency Boundaries

Use this reference when deciding where a fix belongs or whether an import is valid.

## Import Direction

Allowed:

- UI features import `src/shared`, `src/shared/api`, contracts, and feature public APIs.
- Engine higher layers import engine lower layers.
- Engine repositories import capability ports.
- `shared/api` imports Tauri invoke/listen helpers and contract DTOs.
- Rust command modules import Rust capability crates.

Forbidden:

- `src/engine/**` importing React, Zustand stores, `@tauri-apps/api`, or `src/features/**`.
- `src/engine/**` importing concrete `src/shared/api/**` adapters.
- `engine/modes/chat` importing `engine/modes/roleplay` or `engine/modes/game`.
- `engine/modes/roleplay` importing `engine/modes/chat` or `engine/modes/game`.
- `engine/modes/game` importing `engine/modes/chat` or `engine/modes/roleplay`.
- `src/shared/**` importing `src/features/**`.
- Feature code importing another feature's private components/hooks/lib files.
- Rust capability crates depending on TypeScript product concepts beyond opaque DTOs.

## Placement Questions

Ask these before adding a file:

1. Does it render UI? Put it in `features` or `shared/components`.
2. Does it coordinate product behavior? Put it in `engine`, usually a mode or generation layer.
3. Does it perform privileged local work? Put it in Rust and expose a narrow command.
4. Does it only define what TS needs from Rust? Put it in `engine/capabilities`.
5. Is it a Tauri wrapper? Put it in `shared/api`.
6. Is it pure and reused by multiple modes? Put it in `engine/shared`, `engine/entities`, or `engine/generation-core`.

## File Splitting

Split when a file mixes any two of these without a strong reason:

- UI rendering
- storage persistence
- provider transport
- prompt assembly
- mode orchestration
- agent execution
- Tauri command registration
- filesystem/path safety
- import/export parsing

Prefer one module per responsibility. A large owner module can expose a small public function while implementation details live in sibling files.

## Barrels And Re-exports

Avoid barrels whose only purpose is convenience or legacy compatibility. If a public API is needed, create an owner file that contains real behavior, types, or a curated facade. Do not add one-line re-export shims to hide a move.
