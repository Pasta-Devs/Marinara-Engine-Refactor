import { create } from "zustand";

const ACTIVE_CHAT_STORAGE_KEY = "marinara-active-chat-id";

interface ActiveChatSnapshot {
  id: string;
  characterIds?: string | string[] | null;
  mode?: string;
}

interface ChatStore {
  activeChatId: string | null;
  activeChat: ActiveChatSnapshot | null;
  unreadCounts: Map<string, number>;
  setActiveChatId: (id: string | null) => void;
  clearUnread: (chatId: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChatId: (() => {
    try {
      return localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  })(),
  activeChat: null,
  unreadCounts: new Map(),
  setActiveChatId: (id) => {
    set((state) => {
      const unreadCounts = new Map(state.unreadCounts);
      if (id) unreadCounts.delete(id);
      return { activeChatId: id, unreadCounts, ...(!id ? { activeChat: null } : {}) };
    });
    try {
      if (id) localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, id);
      else localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
  clearUnread: (chatId) =>
    set((state) => {
      if (!state.unreadCounts.has(chatId)) return state;
      const unreadCounts = new Map(state.unreadCounts);
      unreadCounts.delete(chatId);
      return { unreadCounts };
    }),
  reset: () => {
    set({ activeChatId: null, activeChat: null, unreadCounts: new Map() });
    try {
      localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
}));
