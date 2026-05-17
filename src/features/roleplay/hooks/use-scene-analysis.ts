import { useMutation } from "@tanstack/react-query";
import type { SceneAnalysis } from "@marinara-engine/shared";

type SceneAnalysisRequest = {
  chatId?: string;
  connectionId?: string;
  narration: string;
  context?: Record<string, unknown>;
};

async function unavailable(): Promise<SceneAnalysis> {
  throw new Error("Scene analysis is deferred until the Rust roleplay/generation backend slice.");
}

export function useSceneAnalysis() {
  return useMutation({
    mutationFn: (_request: SceneAnalysisRequest) => unavailable(),
  });
}
