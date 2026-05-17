export async function forceRefreshSpa(): Promise<void> {
  window.location.reload();
}

export function clearBrowserRuntimeCaches() {
  return Promise.resolve();
}
