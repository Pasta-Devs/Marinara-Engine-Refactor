function deferred(action: string): Promise<never> {
  return Promise.reject(new Error(`${action} is waiting for the Rust prompts/presets backend slice.`));
}

export const api = {
  get: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("preset read") as Promise<T>,
  post: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("preset mutation") as Promise<T>,
  patch: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("preset update") as Promise<T>,
  delete: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("preset delete") as Promise<T>,
  download: (_path: string): Promise<never> => deferred("preset export"),
  downloadPost: (_path: string, _body?: unknown, _filename?: string): Promise<never> => deferred("preset export"),
};
