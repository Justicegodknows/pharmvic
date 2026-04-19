import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Hugging Face Inference API — OpenAI-compatible.
// All AI features route through https://router.huggingface.co/v1 using the HF token.
// Override via environment variables for local dev or alternate providers.
const LLM_BASE_URL =
    process.env.LLM_BASE_URL ?? "https://router.huggingface.co/v1";
const LLM_MODEL =
    process.env.LLM_MODEL ?? "MiniMaxAI/MiniMax-M2.7";
const LLM_API_KEY = process.env.LLM_API_KEY ?? "";

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
            const available = models.map((m) => m.id).join(", ") || "none";
            return {
                ok: false,
                reason: `Model "${LLM_MODEL}" not available on HF Inference API. Available: ${available}`,
            };
        }
        return { ok: true };
    } catch {
        return {
            ok: false,
            reason: `Cannot reach LLM backend at ${LLM_BASE_URL}. Check LLM_BASE_URL and LLM_API_KEY.`,
        };
    }
}
