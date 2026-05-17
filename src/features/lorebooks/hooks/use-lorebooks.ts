import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/lorebooks-api";
import type { Lorebook, LorebookCategory, LorebookEntry, LorebookFolder } from "../types";

export const lorebookKeys = {
  all: ["lorebooks"] as const,
  list: (category?: LorebookCategory) => [...lorebookKeys.all, "list", category ?? "all"] as const,
  detail: (id: string | null) => [...lorebookKeys.all, "detail", id] as const,
  entries: (id: string | null) => [...lorebookKeys.all, "entries", id] as const,
  folders: (id: string | null) => [...lorebookKeys.all, "folders", id] as const,
};

export function useLorebooks(category?: LorebookCategory) {
  return useQuery({
    queryKey: lorebookKeys.list(category),
    queryFn: () => api.get<Lorebook[]>(category ? `/lorebooks?category=${category}` : "/lorebooks"),
    retry: false,
  });
}

export function useLorebook(id: string | null) {
  return useQuery({
    queryKey: lorebookKeys.detail(id),
    queryFn: () => api.get<Lorebook>(`/lorebooks/${id}`),
    enabled: !!id,
    retry: false,
  });
}

export function useLorebookEntries(id: string | null) {
  return useQuery({
    queryKey: lorebookKeys.entries(id),
    queryFn: () => api.get<LorebookEntry[]>(`/lorebooks/${id}/entries`),
    enabled: !!id,
    retry: false,
  });
}

export function useLorebookFolders(id: string | null) {
  return useQuery({
    queryKey: lorebookKeys.folders(id),
    queryFn: () => api.get<LorebookFolder[]>(`/lorebooks/${id}/folders`),
    enabled: !!id,
    retry: false,
  });
}

export function useUpdateLorebook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Lorebook> & { id: string }) => api.patch<Lorebook>(`/lorebooks/${id}`, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: lorebookKeys.all });
      qc.invalidateQueries({ queryKey: lorebookKeys.detail(variables.id) });
    },
  });
}

export function useDeleteLorebook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lorebooks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: lorebookKeys.all }),
  });
}

export function useCreateLorebookEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lorebookId, ...data }: { lorebookId: string } & Partial<LorebookEntry>) =>
      api.post<LorebookEntry>(`/lorebooks/${lorebookId}/entries`, data),
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: lorebookKeys.entries(variables.lorebookId) }),
  });
}
