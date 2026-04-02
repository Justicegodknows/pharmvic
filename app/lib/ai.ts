import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3";

const ollama = createOpenAICompatible({
    name: "ollama",
    baseURL: `${ollamaBaseUrl}/v1`,
});

export function getModel() {
    return ollama.chatModel(ollamaModel);
}

/**
 * Check whether Ollama is reachable and the configured model is available.
 * Returns `{ ok: true }` or `{ ok: false, reason: string }`.
 */
export async function checkOllamaHealth(): Promise<{ ok: true } | { ok: false; reason: string }> {
    try {
        const res = await fetch(`${ollamaBaseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) {
            return { ok: false, reason: `Ollama returned HTTP ${res.status}` };
        }
        const body = await res.json() as { models?: { name: string }[] };
        const models = body.models ?? [];
        const hasModel = models.some((m) => m.name === ollamaModel || m.name.startsWith(`${ollamaModel}:`));
        if (!hasModel) {
            return { ok: false, reason: `Model "${ollamaModel}" not found. Available: ${models.map((m) => m.name).join(', ') || 'none'}` };
        }
        return { ok: true };
    } catch {
        return { ok: false, reason: `Cannot reach Ollama at ${ollamaBaseUrl}. Is Ollama running?` };
    }
}
