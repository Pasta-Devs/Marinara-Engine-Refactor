import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/chats-api";
import type { Chat, ChatMode } from "../types";

export const chatKeys = {
  all: ["chats"] as const,
  list: () => [...chatKeys.all, "list"] as const,
};

export function useChats() {
  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: () => api.get<Chat[]>("/chats"),
    retry: false,
  });
}

export function useCreateChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; mode: ChatMode; characterIds?: string[] }) => api.post<Chat>("/chats", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.list() }),
  });
}

export function useDeleteChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/chats/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.list() }),
  });
}

export function useDeleteChatGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => api.delete(`/chats/group/${groupId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.list() }),
  });
}
