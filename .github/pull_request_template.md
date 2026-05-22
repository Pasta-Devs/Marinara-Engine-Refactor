<!-- Target branch: `main`. ME-Refactor uses `main` as the default integration branch. -->
<!-- Open as a draft while implementation is still in progress. -->

## Linked Issue

<!-- Every PR should reference a feature request or issue report when one exists. -->
<!-- If there is not one yet, open one first when maintainer alignment or discussion is needed: -->
<!-- https://github.com/Pasta-Devs/Marinara-Engine-Refactor/issues/new/choose -->

Closes #

## Why This Change

<!-- What user problem, bug, or goal does this solve? Explain the reason, not only the file edits. -->

-

## Owner And Impact

<!-- Use docs/developer/architecture.html, modules.html, and impact-areas.html before filling this out. -->

- Owner:
- Behavior changed:
- Expected impact area:
- Dependent callers reviewed:
- Affected modes/capabilities:
- Rust/TypeScript boundary touched:

## What Changed

<!-- List the key changes in this PR. -->

-

## Architecture And AI-Assisted Review

<!-- Especially useful for AI-assisted changes. Check only what you personally reviewed. -->

- [ ] Followed nearby repo patterns instead of adding broad helpers, barrels, routers, or compatibility shims
- [ ] Confirmed the change lives in the owning layer/module
- [ ] Avoided accidental leakage between chat, roleplay, and game paths
- [ ] Removed obsolete fallback, placeholder, or fake-success code made unnecessary by the change
- [ ] Checked relevant edge cases and failure paths
- [ ] No generated-by lines, AI co-author trailers, or private local paths were added

## Failure Path Checks

<!-- Mark only what applies and describe the specific cases in manual verification notes. -->

- [ ] Missing, empty, stale, or malformed persisted records considered
- [ ] Missing, moved, invalid, oversized, or permission-blocked files/assets considered
- [ ] Provider, network, timeout, cancellation, or empty-response behavior considered
- [ ] Tauri command, dialog, filesystem, asset protocol, or native-window-only behavior considered
- [ ] Import/export, duplicate ID, old-shape data, or invalid JSON behavior considered
- [ ] Loading, empty, disabled, and error UI states considered
- [ ] Light/dark mode, small viewport, long text, and content overflow considered
- [ ] Chat/roleplay/game mode boundary risk considered when shared code changed
- [ ] Remaining unverified failure paths are called out below

## Validation

<!-- Check only what you personally ran or verified. -->
<!-- If an AI agent filled out or ticked these boxes, treat them as a TODO list, not proof. -->

- [ ] `pnpm typecheck` passes locally
- [ ] `pnpm check:rust` passes locally
- [ ] `pnpm check:docs` passes locally
- [ ] `pnpm build` passes locally, if imports, bundling, or runtime UI paths changed
- [ ] `pnpm check` passes locally, if this PR is ready for broad evaluation
- [ ] Ran the app and clicked through the changed workflow manually
- [ ] Checked relevant edge cases, such as light/dark mode, mobile viewport, empty states, error paths, provider/storage failures, or persisted-data migration paths
- [ ] Read and followed `CONTRIBUTING.md`, `AGENTS.md`, and the relevant `docs/developer/` pages

### Manual Verification Notes

<!-- Describe exactly what you tested in the real browser/app, step by step. -->
<!-- Browser checks are useful for web-renderable UI, but Tauri-only behavior still needs native app verification. -->

-

## Docs And Release Impact

- [ ] No docs/release changes needed
- [ ] Updated developer or user docs as needed
- [ ] Updated release notes/changelog if this is user-facing and release-noteworthy
- [ ] Version/release files updated only if this PR intentionally includes a version bump

## UI Evidence

<!-- Add before/after screenshots or recordings for UI changes. -->
