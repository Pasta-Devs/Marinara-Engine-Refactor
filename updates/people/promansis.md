# Promansis

## Current Work

- Fixing game session continuity bugs through the local-only bug branch workflow.

## Owned Bugs

## Starting a new game session drops carried inventory and player state

- Status: Done
- Owner: Promansis
- Impact area: UI | engine | storage
- Reported: 2026-05-19
- Last updated: 2026-05-19

### Notes

- Failing behavior: `gameApi.startSession` creates the next session with only setup/map/NPC metadata, dropping durable inventory, widget state, time/weather, morale, notes, journal, and the stored `chat.gameState`.
- Owner: `src/features/game/api/game-api.ts`; dependent readers are `GameSurface`, `useSyncGameState`, world-state hydration, and game prompt assembly.
- Resolution: new sessions now carry durable game metadata and `chat.gameState` while leaving combat-only session state behind.

## Status Notes

- Bug 6 branch: `fix/game-session-carryover-state`.
