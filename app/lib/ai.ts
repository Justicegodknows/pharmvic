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
