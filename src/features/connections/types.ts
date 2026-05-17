export type ConnectionProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "cohere"
  | "openrouter"
  | "xai"
  | "custom"
  | "image_generation"
  | string;

export interface ConnectionRow {
  id: string;
  name: string;
  provider: ConnectionProvider;
  model?: string | null;
  baseUrl?: string | null;
  useForRandom?: string | boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
  details?: unknown;
}

export interface ClaudeSubscriptionDiagnosis {
  success: boolean;
  requestedModel: string;
  modelsBilled: string[];
  modelUsageDetail: Array<{ model: string; inputTokens: number; outputTokens: number }>;
  billedDifferent: boolean;
  fastModeState: "off" | "cooldown" | "on" | null;
  response: string;
  errors: string[];
  latencyMs: number;
}
