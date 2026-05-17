function deferred(action: string): Promise<never> {
  return Promise.reject(new Error(`${action} is waiting for the Rust lorebooks backend slice.`));
}

export const api = {
  get: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("lorebook read") as Promise<T>,
  post: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("lorebook mutation") as Promise<T>,
  patch: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("lorebook update") as Promise<T>,
  delete: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("lorebook delete") as Promise<T>,
  download: (_path: string): Promise<never> => deferred("lorebook export"),
  downloadPost: (_path: string, _body?: unknown, _filename?: string): Promise<never> => deferred("lorebook export"),
};
