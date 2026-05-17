import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/presets-api";
import type { Preset, PresetFull, PresetSection } from "../types";

export const presetKeys = {
  all: ["presets"] as const,
  list: () => [...presetKeys.all, "list"] as const,
  full: (id: string | null) => [...presetKeys.all, "full", id] as const,
};

export function usePresets() {
  return useQuery({
    queryKey: presetKeys.list(),
    queryFn: () => api.get<Preset[]>("/prompts"),
    retry: false,
  });
}

export function usePresetFull(id: string | null) {
  return useQuery({
    queryKey: presetKeys.full(id),
    queryFn: () => api.get<PresetFull>(`/prompts/${id}/full`),
    enabled: !!id,
    retry: false,
  });
}

export function useUpdatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Preset> & { id: string }) => api.patch<Preset>(`/prompts/${id}`, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: presetKeys.list() });
      qc.invalidateQueries({ queryKey: presetKeys.full(variables.id) });
    },
  });
}

export function useDeletePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/prompts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: presetKeys.list() }),
  });
}

export function useDuplicatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/prompts/${id}/duplicate`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: presetKeys.list() }),
  });
}

export function useSetDefaultPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/prompts/${id}/default`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: presetKeys.list() }),
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ presetId, ...data }: { presetId: string } & Partial<PresetSection>) =>
      api.post<PresetSection>(`/prompts/${presetId}/sections`, data),
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: presetKeys.full(variables.presetId) }),
  });
}
