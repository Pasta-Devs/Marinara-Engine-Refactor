import { useMutation, useQuery } from "@tanstack/react-query";

export interface ChatImage {
  id: string;
  chatId: string;
  url: string;
  prompt?: string | null;
  model?: string | null;
  provider?: string | null;
  width?: number | null;
  height?: number | null;
  createdAt?: string;
}

async function unavailable(): Promise<never> {
  throw new Error("Gallery backend is deferred until the imports/assets/gallery/media slice.");
}

export function useGalleryImages(chatId: string | null) {
  return useQuery({
    queryKey: ["gallery", "images", chatId],
    queryFn: () => unavailable() as Promise<ChatImage[]>,
    enabled: !!chatId,
    retry: false,
  });
}

export function useUploadGalleryImage(chatId: string | null) {
  return useMutation({
    mutationFn: (_files: File[]) => unavailable(),
    meta: { chatId },
  });
}

export function useDeleteGalleryImage(chatId: string | null) {
  return useMutation({
    mutationFn: (_imageId: string) => unavailable(),
    meta: { chatId },
  });
}
