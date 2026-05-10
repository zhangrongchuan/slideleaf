export type OfficialAiProvider = "deepseek" | "gemini" | "claude-sonnet" | "claude-opus";
export type LocalAiProviderKind = "deepseek" | "gemini" | "anthropic";
export type LocalAiProviderValue =
  | `local:${string}`
  | `local:${string}:sonnet`
  | `local:${string}:opus`;
export type AiProviderValue = OfficialAiProvider | LocalAiProviderValue;

export type LocalAiProviderConfig = {
  id: string;
  provider: LocalAiProviderKind;
  label: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  sonnetModel?: string;
  opusModel?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomAiProviderPayload = {
  provider: LocalAiProviderKind;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  anthropicModelFamily?: "sonnet" | "opus";
};

export type AiProviderRequestPayload = {
  provider: string;
  customProvider?: CustomAiProviderPayload;
};

const LOCAL_AI_PROVIDERS_KEY = "slideleaf.localAiProviders.v1";

export function loadLocalAiProviders(): LocalAiProviderConfig[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_AI_PROVIDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLocalProvider).filter((item): item is LocalAiProviderConfig => Boolean(item));
  } catch {
    return [];
  }
}

export function saveLocalAiProviders(providers: LocalAiProviderConfig[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_AI_PROVIDERS_KEY, JSON.stringify(providers));
}

export function createLocalAiProviderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isLocalAiProviderValue(value: string): value is LocalAiProviderValue {
  return value.startsWith("local:");
}

export function aiProviderRequestPayload(
  value: AiProviderValue,
  providers: LocalAiProviderConfig[]
): AiProviderRequestPayload | null {
  if (!isLocalAiProviderValue(value)) return { provider: value };

  const parsed = parseLocalProviderValue(value);
  const config = providers.find((item) => item.id === parsed.id);
  if (!config) return null;

  if (config.provider === "anthropic") {
    const family = parsed.family ?? "sonnet";
    return {
      provider: family === "opus" ? "claude-opus" : "claude-sonnet",
      customProvider: {
        provider: "anthropic",
        apiKey: config.apiKey,
        baseUrl: config.baseUrl || undefined,
        model: family === "opus" ? config.opusModel || undefined : config.sonnetModel || undefined,
        anthropicModelFamily: family
      }
    };
  }

  return {
    provider: config.provider,
    customProvider: {
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || undefined,
      model: config.model || undefined
    }
  };
}

export function localProviderDisplayName(provider: LocalAiProviderKind): string {
  if (provider === "deepseek") return "DeepSeek";
  if (provider === "gemini") return "Gemini";
  return "Claude";
}

export function defaultModelForLocalProvider(provider: LocalAiProviderKind): string {
  if (provider === "deepseek") return "deepseek-v4-pro";
  if (provider === "gemini") return "gemini-3-flash-preview";
  return "claude-sonnet-4-6";
}

export function parseLocalProviderValue(value: LocalAiProviderValue): {
  id: string;
  family?: "sonnet" | "opus";
} {
  const [, id = "", family] = value.split(":");
  return {
    id,
    family: family === "opus" ? "opus" : family === "sonnet" ? "sonnet" : undefined
  };
}

function normalizeLocalProvider(value: unknown): LocalAiProviderConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const provider = readProvider(record.provider);
  const id = readString(record.id);
  const apiKey = readString(record.apiKey);
  if (!provider || !id || !apiKey) return null;
  const now = new Date().toISOString();
  return {
    id,
    provider,
    label: readString(record.label) || `Own ${localProviderDisplayName(provider)}`,
    apiKey,
    baseUrl: readString(record.baseUrl),
    model: readString(record.model),
    sonnetModel: readString(record.sonnetModel),
    opusModel: readString(record.opusModel),
    createdAt: readString(record.createdAt) || now,
    updatedAt: readString(record.updatedAt) || now
  };
}

function readProvider(value: unknown): LocalAiProviderKind | null {
  if (value === "deepseek" || value === "gemini" || value === "anthropic") return value;
  return null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
