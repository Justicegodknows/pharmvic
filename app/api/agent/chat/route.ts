import { convertToModelMessages, streamText, stepCountIs, type UIMessage, type Tool } from 'ai'
import { getModel, checkLLMHealth } from '@/app/lib/ai'
import { PHARMAGENT_SYSTEM_PROMPT, buildSystemPrompt } from '@/app/lib/pharmagent-system-prompt'
import {
    knowledgeBaseTool,
    webSearchTool,
    webFetchTool,
    supplierSearchTool,
    productLookupTool,
} from '@/app/lib/tools'
import { getStitchMCPClient } from '@/app/lib/mcp'

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const entry = rateLimiter.get(key)

    if (!entry || now > entry.resetAt) {
        rateLimiter.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
        return true
    }

    if (entry.count >= RATE_LIMIT) {
        return false
    }

    entry.count++
    return true
}

export const maxDuration = 120

export async function POST(request: Request): Promise<Response> {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    if (!checkRateLimit(ip)) {
        return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Max 20 requests per minute.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
    }

    const { messages }: { messages: UIMessage[] } = await request.json()

    if (!messages || !Array.isArray(messages)) {
        return new Response(
            JSON.stringify({ error: 'messages array required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    // Verify LLM backend is reachable before attempting to stream
    const health = await checkLLMHealth()
    if (!health.ok) {
        return new Response(
            JSON.stringify({ error: `AI backend unavailable: ${health.reason}` }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
    }

    // Reuse the cached Stitch MCP client when STITCH_MCP_URL is configured.
    // The client is kept alive for the process lifetime so it is available
    // throughout the full streaming response.
    const stitchClient = await getStitchMCPClient()
    const stitchTools = stitchClient ? await stitchClient.tools() : {}
    const stitchEnabled = Object.keys(stitchTools).length > 0

    const tools: Record<string, Tool> = {
        searchKnowledgeBase: knowledgeBaseTool,
        searchWeb: webSearchTool,
        fetchWebPage: webFetchTool,
        searchSuppliers: supplierSearchTool,
        lookupProducts: productLookupTool,
        ...stitchTools,
    }

    const result = streamText({
        model: getModel(),
        system: buildSystemPrompt({ stitchEnabled }),
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
}
