import { checkLLMHealth } from '@/app/lib/ai'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    // Check database
    let dbOk = false
    try {
        await sql`SELECT 1`;
        dbOk = true;
    } catch {
        dbOk = false;
    }

    // Check LLM
    let llm: Awaited<ReturnType<typeof checkLLMHealth>> = { ok: false, reason: 'not checked' }
    try {
        llm = await checkLLMHealth();
    } catch (err) {
        llm = { ok: false, reason: (err instanceof Error ? err.message : 'unknown') }
    }

    const ok = dbOk && llm.ok;
    return NextResponse.json({
        ok,
        database: dbOk,
        llm,
        timestamp: new Date().toISOString(),
    }, { status: ok ? 200 : 503 })
}
