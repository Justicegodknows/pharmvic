import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Docker Model Runner — OpenAI-compatible API.
// Local:  http://localhost:12434/engines/llama.cpp/v1
// Docker: http://model-runner.docker.internal/engines/llama.cpp/v1
// Cloud:  set LLM_BASE_URL + LLM_API_KEY to any OpenAI-compatible provider.
const LLM_BASE_URL =
    process.env.LLM_BASE_URL ?? "http://localhost:12434/engines/llama.cpp/v1";
const LLM_MODEL =
    process.env.LLM_MODEL ?? "hf.co/MiniMaxAI/MiniMax-M2.7";
// Docker Model Runner does not require auth locally; pass a placeholder so the
// SDK does not omit the Authorization header for providers that do need it.
const LLM_API_KEY = process.env.LLM_API_KEY ?? "docker-model-runner";

const llmProvider = createOpenAICompatible({
    name: "llm",
    baseURL: LLM_BASE_URL,
    apiKey: LLM_API_KEY,
});

export function getModel() {
    return llmProvider.chatModel(LLM_MODEL);
}

/**
 * Check whether the LLM backend is reachable and the configured model is available.
 * Returns `{ ok: true }` or `{ ok: false, reason: string }`.
 */
export async function checkLLMHealth(): Promise<{ ok: true } | { ok: false; reason: string }> {
    try {
        const res = await fetch(`${LLM_BASE_URL}/models`, {
            headers: { Authorization: `Bearer ${LLM_API_KEY}` },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
            return { ok: false, reason: `LLM backend returned HTTP ${res.status}` };
        }
        const body = await res.json() as { data?: { id: string }[] };
        const models = body.data ?? [];
        const hasModel = models.some((m) => m.id === LLM_MODEL);
        if (!hasModel) {
            const hint = `Run: docker model run ${LLM_MODEL}`;
            const available = models.map((m) => m.id).join(", ") || "none";
            return {
                ok: false,
                reason: `Model "${LLM_MODEL}" not loaded. ${hint}. Available: ${available}`,
            };
        }
        return { ok: true };
    } catch {
        return {
            ok: false,
            reason: `Cannot reach LLM backend at ${LLM_BASE_URL}. Is Docker Model Runner active?`,
        };
    }
}
