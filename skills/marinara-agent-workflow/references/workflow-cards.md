# Marinara Workflow Cards

Use the smallest card that fits the task. These cards supplement `AGENTS.md`; they do not override Marinara's architecture, mode, or bugfix skills.

## Investigation

Use when the user reports a symptom, log, screenshot, confusing runtime behavior, or suspected regression without a clear request to patch.

1. Capture expected behavior, actual behavior, repro steps, environment, data involved, and intermittency from available evidence before asking questions.
2. Trace from visible entrypoint through UI, feature hook/API, engine service, shared contract, storage, prompt/provider, adapter, command, or Rust capability as needed.
3. State root cause or leading hypothesis, evidence, blast radius, likely files, core claim, and residual uncertainty before patching.
4. If the first assumption was wrong, say so and revise the diagnosis.
5. Switch to bugfix, feature build, or issue drafting only when that lane is clear.

Avoid patching before diagnosis except for tiny mechanical mistakes.

## Bugfix

Use when the user says something is broken or asks for a fix.

1. Restate the failing behavior and narrow fix boundary.
2. Load `marinara-bugfix-discipline`.
3. Name owner, impact area, callers, contracts, affected modes/capabilities, and checks.
4. Reproduce before editing when practical.
5. Fix the lowest correct owner rather than adding a caller-side guard.
6. Remove exposed fake-success, catch-and-ignore, old-shape compatibility, broad default, or placeholder branches.
7. Verify the original repro or the closest representative path.
8. Run the matching baseline checks.
9. Report root cause, files, changelog/docs status when relevant, verification, related issues not fixed, and manual blockers.

Proof must cover the user-facing symptom or core behavior, not only the edited line.

## Feature Build

Use when the user asks to add capability.

Classify first:

- Small: one to three files, no schema, no new architecture, no new mode.
- Medium: four to ten files, a new UI surface, or a new connection between existing systems.
- Big: more than ten files, a new agent/mode, a new persistent data shape, or a prompt/storage pipeline change.

Small features can proceed after a short restate. Medium features need a brief plan. Big features need architecture options and approved phases. If scope grows, stop and reclassify.

Before editing, identify the product owner, public entrypoint, private implementation files, reusable contracts/repositories/capabilities/UI primitives, affected modes, and verification path.

## Refactor Or Cleanup

Use when moving code, splitting files, simplifying ownership, or modernizing a subsystem.

State:

- Core behavioral claim that must remain true.
- Owner boundary and dependency direction.
- Files expected to move or split.
- Code-smell risk being reduced.
- Proof that behavior did not regress.

Block when proof does not cover the behavioral claim, public behavior changes without a product decision, the diff spreads conditionals across more owners, dead speculative layers are added, or the PR cannot be reviewed as one coherent change.

Prefer preserving behavior first and improving structure in a follow-up only when that split makes the work safer and reviewable.

## Review And PR

Use for quick checks, formal reviews, PR readiness, and shipping.

For review, lead with findings ordered by severity, grounded in file/line references. If there are no findings, say so and mention residual test gaps.

Before push or PR:

1. Check dirty tree and include only intentional files.
2. Verify remotes and target branch.
3. Confirm proof exists for the PR claim.
4. Confirm docs/changelog/release notes are updated when the change is user-facing or PR-affecting, or record why not needed.
5. Draft external text exactly.

After push, inspect required checks and unresolved inline review threads when available. Ask before posting arbitrary external replies.

## Issue Drafting

Use when the user asks to make, submit, or file a GitHub issue from rough notes, screenshots, logs, or excerpts.

1. Route as bug, feature request, task, or not an issue.
2. Extract only visible facts: title, source, timestamp, expected result, actual result, repro, environment, logs, screenshots, and missing facts.
3. Use the repo's issue template exactly when present.
4. Do not invent facts or claim screenshots are attached unless files or URLs are available.
5. Draft exact issue text and wait for approval unless standing approval was given.

## Durable Notes

Use `updates/` for bug ownership and active work per `AGENTS.md`.

Capture durable notes only when a team decision, reusable debugging lesson, architecture clarification, or cross-issue/cross-PR status needs to survive the session. Do not store secrets, private user data, bulky raw logs, or machine-local paths unless the repo already expects them.
