# Xel

## Current Work

- Issue 27: Click and Drag functionality broken - fixed locally, awaiting review

## Owned Bugs

## Issue 27: Click and Drag functionality broken

- Status: Fixed locally
- Owner: Xel
- Impact area: Preset editor and lorebook editor drag reorder UI
- Reported: 2026-05-20
- Last updated: 2026-05-20

### Steps

1. Open the preset or lorebook editor.
2. Try to drag sections, variables, folders, or entries by their grip handles.

### Expected

Rows reorder when dragged by their grip handles.

### Actual

Rows fade as if dragging starts, but the item cannot be moved.

### Notes

The drag source was gated by transient mouse-down state on the handle. The fix makes the grip handle the draggable element and keeps the row as the drop target, so only handle-originated drags reorder rows.

## Status Notes

No status notes currently listed.
