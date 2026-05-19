# Promansis

## Current Work

- Fixing game checkpoint access through the local-only bug branch workflow.

## Owned Bugs

## Game checkpoint manager is not reachable from the game surface

- Status: Done
- Owner: Promansis
- Impact area: UI | engine
- Reported: 2026-05-19
- Last updated: 2026-05-19

### Notes

- Failing behavior: `GameCheckpoints` and checkpoint hooks/API exist, but `GameSurface` has no visible entry point or restore refresh path.
- Owner: `src/features/game/components/GameSurface.tsx`; dependent restore path is `gameApi.loadCheckpoint`, chat detail/messages queries, and `useGameStateStore`.
- Resolution: the game surface now exposes the checkpoint manager on desktop and mobile, and refreshes chat/game state after a checkpoint restore.

## Status Notes

- Bug 11 branch: `fix/game-checkpoint-manager-surface`.
