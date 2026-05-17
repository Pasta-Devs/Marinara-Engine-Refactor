function deferred(action: string): Promise<never> {
  return Promise.reject(new Error(`${action} is waiting for the Rust chats backend slice.`));
}

export const api = {
  get: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("chat read") as Promise<T>,
  post: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("chat mutation") as Promise<T>,
  patch: <T = unknown>(_path: string, _body?: unknown, _init?: RequestInit): Promise<T> =>
    deferred("chat update") as Promise<T>,
  delete: <T = unknown>(_path: string, _init?: RequestInit): Promise<T> => deferred("chat delete") as Promise<T>,
};
