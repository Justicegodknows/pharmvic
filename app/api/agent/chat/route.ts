import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { getModel } from '@/app/lib/ai'
import { PHARMAGENT_SYSTEM_PROMPT } from '@/app/lib/pharmagent-system-prompt'

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

export const maxDuration = 60

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

    const result = streamText({
        model: getModel(),
        system: PHARMAGENT_SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
}
