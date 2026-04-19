// Embeddings use the HuggingFace Inference API's OpenAI-compatible endpoint.
// The same LLM_BASE_URL (https://router.huggingface.co/v1) and LLM_API_KEY are
// reused so no extra environment variables are required.
//
// Default model: mixedbread-ai/mxbai-embed-large-v1
//   → 1024-dimensional vectors — identical to the former Ollama mxbai-embed-large
//   → no pgvector schema migration required
//
// Override: set HF_EMBEDDING_MODEL to any HF model that outputs 1024-dim vectors.

const EMBEDDING_BASE_URL = process.env.LLM_BASE_URL ?? 'https://router.huggingface.co/v1'
const EMBEDDING_MODEL =
    process.env.HF_EMBEDDING_MODEL ?? 'mixedbread-ai/mxbai-embed-large-v1'
const EMBEDDING_API_KEY = process.env.LLM_API_KEY ?? ''

type HFEmbeddingResponse = {
    data: { embedding: number[]; index: number }[]
}

/**
 * Call the HF router's OpenAI-compatible /v1/embeddings endpoint.
 * Accepts one or more input strings and returns one embedding per input.
 */
async function callEmbeddingAPI(input: string | string[]): Promise<number[][]> {
    const response = await fetch(`${EMBEDDING_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${EMBEDDING_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HF embedding request failed (${response.status}): ${errorText}`)
    }

    const data = await response.json() as HFEmbeddingResponse
    // Sort by index to guarantee order matches input order
    return data.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding)
}

/**
 * Generate a single embedding vector via HuggingFace Inference API.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const results = await callEmbeddingAPI(text)
    return results[0]
}

/**
 * Generate embeddings for multiple texts in a single API call.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    return callEmbeddingAPI(texts)
}
