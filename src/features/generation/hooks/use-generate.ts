type GenerateArgs = {
  chatId: string;
  connectionId?: string | null;
  message?: string;
  [key: string]: unknown;
};

async function unavailable(): Promise<never> {
  throw new Error("Generation is deferred until the Rust generation backend slice.");
}

export function useGenerate() {
  return {
    generate: (_args: GenerateArgs) => unavailable(),
    retryAgents: (_chatId: string, _agentTypes?: string[], _options?: Record<string, unknown>) => unavailable(),
  };
}
