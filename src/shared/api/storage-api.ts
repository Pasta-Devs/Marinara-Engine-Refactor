import type { StorageGateway, StorageListOptions } from "../../engine/capabilities/storage";
import { ApiError } from "./api-client";
import { spotifyApi } from "./integration-utility-api";
import { invokeTauri } from "./tauri-client";

function parseOperation(operation: string) {
  const url = new URL(operation.startsWith("/") ? `local://marinara${operation}` : `local://marinara/${operation}`);
  return {
    parts: url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part)),
    query: url.searchParams,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

async function patchChatObjectField(chatId: string, field: string, patch: unknown) {
  const chat = await storageApi.get<Record<string, unknown>>("chats", chatId);
  if (!chat) throw new ApiError(`Chat ${chatId} was not found`, 404);
  const current = asRecord(chat[field]);
  return storageApi.update("chats", chatId, { [field]: { ...current, ...asRecord(patch) } });
}

async function localStorageRequest<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  operation: string,
  payload?: unknown,
): Promise<T> {
  const { parts, query } = parseOperation(operation);

  if (parts[0] === "chats" && parts[2] === "messages" && parts.length === 3) {
    const chatId = parts[1];
    if (method === "GET") {
      return storageApi.list<T extends unknown[] ? T[number] : unknown>("messages", { filters: { chatId } }) as Promise<T>;
    }
    if (method === "POST") {
      const record: Record<string, unknown> = { ...asRecord(payload), chatId };
      record.role ??= "user";
      record.content ??= "";
      record.extra ??= {};
      record.activeSwipeIndex ??= 0;
      record.swipes ??= [{ content: record.content }];
      return storageApi.create<T>("messages", record);
    }
  }

  if (parts[0] === "chats" && parts[2] === "messages" && parts[3] && parts.length === 4) {
    const messageId = parts[3];
    if (method === "DELETE") return storageApi.delete("messages", messageId) as Promise<T>;
    if (method === "PATCH") return storageApi.update<T>("messages", messageId, asRecord(payload));
  }

  if (parts[0] === "chats" && parts[2] === "messages" && parts[3] && parts[4] === "extra" && method === "PATCH") {
    const messageId = parts[3];
    const message = await storageApi.get<Record<string, unknown>>("messages", messageId);
    if (!message) throw new ApiError(`Message ${messageId} was not found`, 404);
    return storageApi.update<T>("messages", messageId, {
      extra: { ...asRecord(message.extra), ...asRecord(payload) },
    });
  }

  if (parts[0] === "chats" && parts[2] === "metadata" && method === "PATCH") {
    return patchChatObjectField(parts[1], "metadata", payload) as Promise<T>;
  }

  if (parts[0] === "chats" && parts[2] === "summaries" && method === "PATCH") {
    return patchChatObjectField(parts[1], "metadata", payload) as Promise<T>;
  }

  if (parts[0] === "spotify") {
    const body = asRecord(payload);
    const agentId = query.get("agentId") ?? (typeof body.agentId === "string" ? body.agentId : null);
    if (parts[1] === "player" && method === "GET") return spotifyApi.player<T>(agentId ? { agentId } : null);
    if (parts[1] === "playlists" && method === "GET") {
      const limit = Number(query.get("limit") ?? body.limit ?? 50);
      return spotifyApi.playlists<T>({ agentId, limit: Number.isFinite(limit) ? limit : 50 });
    }
    if (parts[1] === "playlist-tracks" && method === "POST") return spotifyApi.playlistTracks<T>(body);
    if (parts[1] === "search-tracks" && method === "POST") return spotifyApi.searchTracks<T>(body);
    if (parts[1] === "player" && parts[2] === "play" && method === "PUT") return spotifyApi.play(body) as Promise<T>;
    if (parts[1] === "player" && parts[2] === "volume" && method === "PUT") return spotifyApi.volume(body) as Promise<T>;
  }

  if (parts[0] === "custom-tools" && parts[1] === "execute" && method === "POST") {
    return invokeTauri<T>("custom_tool_execute", { body: payload ?? null });
  }

  throw new ApiError(`Unsupported local storage operation: ${method} ${operation}`, 400, { method, operation });
}

export const storageApi: StorageGateway = {
  list: (entity: string, options?: StorageListOptions) =>
    invokeTauri("storage_list", {
      entity,
      options: options ?? null,
    }),
  get: (entity: string, id: string) =>
    invokeTauri("storage_get", {
      entity,
      id,
    }),
  create: (entity: string, value: Record<string, unknown>) =>
    invokeTauri("storage_create", {
      entity,
      value,
    }),
  update: (entity: string, id: string, patch: Record<string, unknown>) =>
    invokeTauri("storage_update", {
      entity,
      id,
      patch,
    }),
  delete: (entity: string, id: string) =>
    invokeTauri("storage_delete", {
      entity,
      id,
    }),
  request: (method, operation, payload?: unknown) => localStorageRequest(method, operation, payload),
  call: (operation: string, payload?: unknown) => localStorageRequest("POST", operation, payload),
};
