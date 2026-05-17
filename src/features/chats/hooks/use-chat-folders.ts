import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/chats-api";
import { chatKeys } from "./use-chats";
import type { ChatFolder, ChatMode } from "../types";

export const folderKeys = {
  all: ["chat-folders"] as const,
  list: () => [...folderKeys.all, "list"] as const,
};

export function useChatFolders() {
  return useQuery({
    queryKey: folderKeys.list(),
    queryFn: () => api.get<ChatFolder[]>("/chat-folders"),
    retry: false,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; mode: ChatMode; color?: string }) => api.post<ChatFolder>("/chat-folders", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.list() }),
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name?: string; color?: string; sortOrder?: number; collapsed?: boolean }) =>
      api.patch<ChatFolder>(`/chat-folders/${data.id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.list() }),
  });
}

export function useMoveChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { chatId: string; folderId: string | null }) => api.post("/chat-folders/move-chat", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.list() }),
  });
}
