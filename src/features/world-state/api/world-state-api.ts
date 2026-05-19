import type { GameState } from "../../../engine/contracts/types/game-state";
import { storageApi } from "../../../shared/api/storage-api";

export type WorldState = GameState;
export type WorldStatePatch = Record<string, unknown>;

function createEmptyWorldState(chatId: string): WorldState {
  return {
    id: "",
    chatId,
    messageId: "",
    swipeIndex: 0,
    date: null,
    time: null,
    location: null,
    weather: null,
    temperature: null,
    presentCharacters: [],
    recentEvents: [],
    playerStats: null,
    personaStats: null,
    createdAt: "",
  };
}

export const worldStateApi = {
  get: async (chatId: string, init?: RequestInit) => {
    if (init?.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    const chat = await storageApi.get<{ gameState?: WorldState }>("chats", chatId);
    return chat?.gameState ?? null;
  },
  patch: async (chatId: string, patch: WorldStatePatch, init?: RequestInit) => {
    if (init?.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    const chat = await storageApi.get<{ gameState?: WorldState }>("chats", chatId);
    const existing = chat?.gameState ?? createEmptyWorldState(chatId);
    const next = { ...existing, chatId, ...patch } as unknown as WorldState;
    await storageApi.update("chats", chatId, { gameState: next });
    return next;
  },
};
