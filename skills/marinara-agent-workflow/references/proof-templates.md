# Marinara Proof Templates

Use these templates only when they add clarity. Tiny tasks do not need ceremony.

## Pre-Edit Gate

```text
Owner:
Impact area:
Callers:
Contracts:
Affected modes/capabilities:
Boundary path:
Dependency direction:
Shared-code justification:
Forbidden shortcuts avoided:
Checks planned:
```

For tiny edits, reduce this to `Owner`, `Impact`, `Modes/Capabilities`, and `Checks`.

## Risk Claim Matrix

Use for storage, import/export, user data, prompt/provider/parser, auth/secrets, destructive actions, compatibility, and new abstractions.

```json
{
  "core_claim": "",
  "risk_type": "",
  "entrypoints": [],
  "current_paths_or_formats": [],
  "legacy_paths_or_formats": [],
  "positive_rows_tested": [],
  "negative_controls_tested": [],
  "ground_truth_facts": [],
  "user_facing_copy": "",
  "manual_blockers": [],
  "untested_paths": []
}
```

## Manual Verification Script

Use when machine checks cannot prove the full claim.

```text
Start command:
App path or route:
Action sequence:
Expected result:
Failure signal:
Unverified coverage:
```

Name unverified mode, provider, viewport, platform, data shape, or legacy path explicitly.

## PR Proof Block

```text
Claim:
Proof:
User path not proven:
Adjacent legacy/default path that could contradict the claim:
Docs/changelog status:
Ownership/coupling review:
Manual verification:
```

## Final Report

```text
Behavior changed:
Files/modules:
Impact area:
Dependent areas reviewed:
Verification:
Manual QA:
Risk:
Debt:
Mud risk:
```

Use `Debt: none` when no known debt remains. Otherwise classify as `deliberate-prudent`, `inadvertent-prudent`, `deliberate-reckless`, or `inadvertent-reckless` and name the follow-up.

Use `Mud risk: none` when the change keeps ownership clear. Otherwise classify as `throwaway-code-survived`, `piecemeal-growth`, `keep-it-working-pressure`, `shearing-layer-drift`, `swept-under-rug`, or `reconstruction-needed` and name containment.

## Maintainer Self-Review

Ask before saying done:

- Does the implementation match the actual user problem?
- Does proof demonstrate the real claim?
- What user path did proof fail to prove?
- What adjacent legacy or default path could contradict the claim?
- Did the diff preserve Marinara's owner modules and dependency direction?
- Did the diff add bloat, repeated conditionals, shotgun surgery, disposable code, or coupling?
- Are docs, skills, updates, or changelog changes needed for the durable decision?
