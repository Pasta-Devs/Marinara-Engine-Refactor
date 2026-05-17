import { useQuery } from "@tanstack/react-query";
import type { TTSConfig } from "@marinara-engine/shared";

export function useTTSConfig() {
  return useQuery<TTSConfig | null>({
    queryKey: ["tts", "config"],
    queryFn: async () => null,
    staleTime: Infinity,
  });
}
