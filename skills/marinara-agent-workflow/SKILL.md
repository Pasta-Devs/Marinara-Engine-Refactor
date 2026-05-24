---
name: marinara-agent-workflow
description: "Apply Marinara's repo-local version of the Chai agent workflow pack for proof discipline, investigations, feature sizing, refactor handoffs, reviews, PR readiness, issue drafting, risky-work evidence, debt notes, and final status reports. Use for nontrivial coding work, ambiguous symptoms, refactors, reviews, PR/issue workflows, or any task where an agent must prove claims while preserving Marinara's code separation and module ownership rules."
---

# Marinara Agent Workflow

## Overview

Use this skill as a workflow overlay, not a replacement for `AGENTS.md` or the more specific Marinara skills. It adapts the cloned Chai Agent Workflow Pack to this repo so agents can keep proof, review, risk, and communication discipline while still obeying Marinara's layered Tauri architecture.

Source context: adapted from `cha1latte/chai-agent-workflow-pack`. Keep only the repo-specific workflow here; update this skill when the repo's agent workflow changes.

## Priority

Follow instructions in this order:

1. Root `AGENTS.md` and repo-local skills.
2. The user's latest request.
3. This workflow overlay.
4. Assistant defaults.

When this workflow conflicts with a repo rule, keep the repo rule. When it makes verification, security, destructive actions, external communication, or user-data handling safer, call out the conflict briefly and use the safer path if it does not violate repo policy.

## Load With

- Load `skills/marinara-architecture-guard/SKILL.md` for imports, file layout, shared modules, Tauri adapters, Rust capabilities, repositories, or cross-feature boundaries.
- Load `skills/marinara-mode-separation/SKILL.md` for chat, roleplay, game, prompt assembly, generation routing, scene logic, autonomous flows, or mode UI.
- Load `skills/marinara-bugfix-discipline/SKILL.md` for regressions, broken UI actions, failing checks, provider/storage/import/generation problems, or root-cause repairs.

Read `references/workflow-cards.md` for the active lane. Read `references/proof-templates.md` when a task needs a risk matrix, PR proof block, manual verification script, debt note, or final done shape.

## Repo Boundary Gate

Before nontrivial edits, scale the gate to risk:

- Tiny: owner, impact, affected modes/capabilities, checks.
- Normal: owner, impact area, callers, contracts, affected modes/capabilities, checks.
- Risky or cross-layer: boundary path, input/output/persistence/error behavior, dependency direction, shared-code justification, forbidden shortcuts avoided, docs/skills impact.

Use Marinara's module rules while applying the gate:

- React feature code stays in `src/features` and calls feature APIs, hooks, engine entrypoints, or `src/shared/api` wrappers.
- Product behavior stays in `src/engine`; engine code must not import React, Zustand stores, Tauri APIs, feature internals, or concrete `src/shared/api` adapters.
- Tauri wrappers stay in `src/shared/api`.
- Engine services receive `src/engine/capabilities` ports; feature/runtime/app-edge code binds those ports to shared API wrappers.
- New or touched feature code should not call `invokeTauri` directly from `tauri-client.ts`; add or use a focused shared API wrapper.
- Privileged storage, path safety, secrets, provider transport, and local integrations stay in Rust capabilities and thin Tauri commands.
- Chat, roleplay, and game keep separate top-level mode owners; shared code must be a lower-layer primitive, not a generic mode flag or catch-all orchestrator.

If ownership, callers, contract shape, or dependency direction cannot be named clearly, resolve that before editing.

## Core Loop

1. Pick the lane: investigate, bugfix, feature build, refactor, review/PR, issue drafting, or durable note.
2. State the narrow claim being proven.
3. Name the owner and expected impact before editing.
4. Reproduce or inspect enough evidence to avoid patching the wrong layer.
5. Make the smallest coherent change in the owning module.
6. Verify the claim with commands, UI proof, screenshots, or a manual script.
7. Review the diff for ownership, duplication, coupling, bloat, repeated conditionals, and hidden fallbacks.
8. Report verification gaps as gaps, not confidence.

## Risky Work

Treat these as risky: storage, migrations, import/export, installers, user data, prompt assembly, provider transport, auth/secrets, destructive actions, cross-entrypoint behavior, legacy compatibility, and new abstractions.

Risky work needs claim-boundary proof: core claim, entrypoints, current and legacy paths, positive rows, negative controls, ground-truth facts, user-facing copy when relevant, manual blockers, and untested paths.

For generation or memory work, trace the full path from input or persisted data through prompt assembly, model/provider call, parser/repair/validation, persistence, and UI/debug visibility. Do not conflate chat memory, roleplay scene memory, game state text, lorebook activation, summaries, knowledge retrieval, or autonomous memory.

## Communication

- Keep routine updates short and concrete.
- For reviews, lead with findings.
- For PR bodies, issue bodies, and reviewer replies, draft exact external text and wait for approval unless the user already gave standing approval.
- Do not claim tests, browser checks, screenshots, pushes, posts, or command verification happened unless they did.
- Final reports for code changes must include behavior changed, files/modules touched, impact area, dependent areas reviewed, verification, and remaining risk.

## Tool Capability Fallback

Use the best local tools available. If the current agent cannot read files, run commands, inspect screenshots, browse local UI, or fetch current docs, ask for the smallest exact artifact needed or provide the exact command/manual test for the user to run.

For transient proof notes, prefer temporary local notes or command output in the session. Use `updates/` only for durable bug ownership, active work status, reusable debugging lessons, or architecture decisions that should survive the task.

## Code Smell Guard

For nontrivial work, name the main structural risk before coding and check it again before done:

- Bloat: large mixed files, long functions, long parameter lists, data clumps.
- Repeated conditionals: mode/type/provider branching spreading across files.
- Shotgun surgery: one change requiring scattered edits across owners.
- Disposable code: dead code, speculative wrappers, compatibility shims, fake fallbacks.
- Coupling: feature internals, cross-mode imports, wrong-layer dependencies, message chains.

Escalate a smell to a blocker when it creates correctness, proof, data-safety, security, or shipping risk. Otherwise report it as a bounded review note or follow-up.
Existing broad files and raw invoke sites in the repo are not permission to add more. When touching one, either contain the change inside the current owner or carve out the smallest owner module/wrapper needed for the current behavior.
