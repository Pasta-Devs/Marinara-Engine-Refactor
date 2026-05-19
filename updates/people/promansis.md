# Promansis

## Current Work

- Boolean configuration normalization
  - Status: Fixed locally on `fix/boolish-config-normalization`
  - Impact area: Connections quick switchers, random connection resolution, prompt preset default display/default lookup
  - Next step: Manual smoke in the desktop app: toggle random-pool membership from Connections and quick switchers, then verify preset default badges after setting a default.
  - Blockers: None.

## Owned Bugs

## Connection random-pool toggle can invert stored boolean state

- Status: Fixed locally on `fix/boolish-config-normalization`
- Owner: Promansis
- Impact area: Connections UI, quick switchers, random connection resolvers
- Reported: Local backlog item 17
- Last updated: 2026-05-19
- Notes: Boolish reads now accept boolean `true` and legacy string truth values in connection UI and dependent random/default connection resolvers; writes remain boolean.

## Prompt preset default badge does not recognize boolean defaults

- Status: Fixed locally on `fix/boolish-config-normalization`
- Owner: Promansis
- Impact area: Prompt presets panel and default preset lookup
- Reported: Local backlog item 18
- Last updated: 2026-05-19
- Notes: Prompt preset default list display and default lookup now accept boolean `true` and legacy string truth values.

## Status Notes

No status notes currently listed.
