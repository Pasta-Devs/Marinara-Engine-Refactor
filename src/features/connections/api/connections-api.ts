function deferred(action: string): Promise<never> {
  return Promise.reject(new Error(`${action} is waiting for the Rust connections backend slice.`));
}

export const api = {
  get: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("connection read") as Promise<T>,
  post: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("connection mutation") as Promise<T>,
  patch: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("connection update") as Promise<T>,
  put: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("connection default parameter update") as Promise<T>,
  delete: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> =>
    deferred("connection delete") as Promise<T>,
};
