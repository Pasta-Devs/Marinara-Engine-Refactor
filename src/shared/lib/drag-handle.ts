const DRAG_HANDLE_SELECTOR = "[data-drag-handle='true']";

export function isDragHandleEventTarget(target: EventTarget | null): boolean {
  return typeof Element !== "undefined" && target instanceof Element && target.closest(DRAG_HANDLE_SELECTOR) !== null;
}
