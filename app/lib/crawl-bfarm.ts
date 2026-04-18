/**
 * BfArM Zyte Crawler — RAG Ingestion Pipeline
 *
 * Crawls the BfArM (Federal Institute for Drugs and Medical Devices) English
 * website using the Zyte API, extracts regulatory content, chunks it, generates
 * embeddings with Ollama, and indexes everything in Docker PostgreSQL (pgvector).
 *
 * BfArM is a government site (not a blog), so many pages render as info portals
 * rather than articles. This crawler tries article autoextract first; if the page
 * yields no article body it falls back to browser-rendered HTML with lightweight
 * HTML stripping to produce plain text.
 *
 * Pipeline:
 *   URL Discovery (curated sitemap) → Zyte Extract (article OR browserHtml)
 *     → Plain-text normalisation → Chunk → Embed (Ollama) → pgvector
 *
 * Run with:
 *   npm run crawl:bfarm
 *
 * Required environment variables (.env.local):
 *   ZYTE_API_KEY          — Zyte API key
 *   RAG_ADMIN_API_KEY     — Admin key for POST /api/agent/knowledge
 *   NEXT_PUBLIC_APP_URL   — Base URL of the running Next.js app (default: http://localhost:3000)
 *
 * Optional:
 *   BFARM_MAX_PAGES       — Maximum pages to ingest (default: 150)
 *   BFARM_MIN_PRIORITY    — Minimum URL priority tier 1–3 (default: 2)
 *   BFARM_CONCURRENCY     — Parallel Zyte API requests (default: 3)
 *
 * Notes:
 * - The app dev server (npm run dev) must be running before executing this script.
 * - Pages already ingested are de-duped automatically via source_url.
 * - Zyte routes requests through a German IP (geolocation: DE) for BfArM.
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { discoverBfarmUrls } from './bfarm-sitemap'
import { ZyteClient } from './zyte-client'

// ─── Configuration ──────────────────────────────────────────────────────────

const ZYTE_API_KEY = process.env.ZYTE_API_KEY ?? ''
const RAG_ADMIN_API_KEY = process.env.RAG_ADMIN_API_KEY ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const INGEST_ENDPOINT = `${BASE_URL}/api/agent/knowledge`

const MAX_PAGES = parseInt(process.env.BFARM_MAX_PAGES ?? '150', 10)
const MIN_PRIORITY = parseInt(process.env.BFARM_MIN_PRIORITY ?? '2', 10) as 1 | 2 | 3
const CONCURRENCY = parseInt(process.env.BFARM_CONCURRENCY ?? '3', 10)
const MIN_CONTENT_LENGTH = 200

// ─── Validation ──────────────────────────────────────────────────────────────

function validateEnv(): void {
    const missing: string[] = []
    if (!ZYTE_API_KEY) missing.push('ZYTE_API_KEY')
    if (!RAG_ADMIN_API_KEY) missing.push('RAG_ADMIN_API_KEY')
    if (missing.length > 0) {
        console.error(`\n[BfArM Crawler] Missing required environment variables:`)
        for (const v of missing) console.error(`  - ${v}`)
        console.error('\nAdd them to .env.local and try again.\n')
        process.exit(1)
    }
}

// ─── HTML → plain text ───────────────────────────────────────────────────────

/**
 * Strips HTML tags and collapses whitespace to extract usable plain text
 * from browser-rendered HTML when Zyte article autoextract returns nothing.
 * Removes <script>, <style>, <nav>, <footer>, <header>, and cookie banners.
 */
function htmlToPlainText(html: string): string {
    return html
        // Remove elements that add no content value
        .replace(/<(script|style|nav|footer|header|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        // Strip all remaining tags
        .replace(/<[^>]+>/g, ' ')
        // Decode common HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim()
}

// ─── Ingest helper ───────────────────────────────────────────────────────────

type IngestPayload = {
    title: string
    content: string
    sourceType: string
    sourceUrl: string
    metadata: Record<string, unknown>
}

type IngestResponse = {
    chunksCreated?: number
    documentId?: string
}

async function ingestPage(payload: IngestPayload): Promise<IngestResponse> {
    const res = await fetch(INGEST_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': RAG_ADMIN_API_KEY,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Ingest API ${res.status}: ${text.slice(0, 300)}`)
    }

    return res.json() as Promise<IngestResponse>
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    validateEnv()

    console.log('\n╔══════════════════════════════════════════════════╗')
    console.log('║      BfArM Zyte Crawler — RAG Ingestion          ║')
    console.log('╚══════════════════════════════════════════════════╝\n')
    console.log(`Target        : https://www.bfarm.de/ (English)`)
    console.log(`Max pages     : ${MAX_PAGES}`)
    console.log(`Min priority  : ${MIN_PRIORITY} (1=all, 2=informational+regulatory, 3=regulatory only)`)
    console.log(`Concurrency   : ${CONCURRENCY} parallel Zyte requests`)
    console.log(`Ingest URL    : ${INGEST_ENDPOINT}\n`)

    // Step 1: Discover URLs from curated list
    console.log('─── Step 1: URL Discovery ────────────────────────\n')
    const discoveredUrls = discoverBfarmUrls({ maxUrls: MAX_PAGES, minPriority: MIN_PRIORITY })

    console.log(`\nWill crawl ${discoveredUrls.length} URLs\n`)

    // Step 2: Extract & ingest in batches
    console.log('─── Step 2: Extraction & Ingestion ──────────────\n')

    const zyte = new ZyteClient(ZYTE_API_KEY)
    const totalBatches = Math.ceil(discoveredUrls.length / CONCURRENCY)

    let ingested = 0
    let skipped = 0
    let failed = 0

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const batch = discoveredUrls.slice(batchIdx * CONCURRENCY, (batchIdx + 1) * CONCURRENCY)
        console.log(`\n[Batch ${batchIdx + 1}/${totalBatches}] Processing ${batch.length} URLs…`)

        await Promise.allSettled(
            batch.map(async ({ url, priority, section }) => {
                let title = ''
                let content = ''

                // Try article autoextract first (structured content)
                const article = await zyte.extractArticle(url)

                if (article?.articleBody && article.articleBody.length >= MIN_CONTENT_LENGTH) {
                    title = article.headline ?? section
                    content = article.articleBody
                } else {
                    // Fall back to browser HTML + strip tags
                    const html = await zyte.extract({ url, browserHtml: true, geolocation: 'DE' })
                        .then((r) => r.browserHtml ?? null)
                        .catch(() => null)

                    if (!html) {
                        console.log(`  SKIP (fetch failed): ${url}`)
                        skipped++
                        return
                    }

                    content = htmlToPlainText(html)

                    // Extract a title from <title> tag if present
                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
                    title = titleMatch
                        ? titleMatch[1]
                            .replace(/\s*[-|–]\s*BfArM.*$/i, '')
                            .replace(/\s*[-|–]\s*Federal Institute.*$/i, '')
                            .trim()
                        : section
                }

                if (content.length < MIN_CONTENT_LENGTH) {
                    console.log(`  SKIP (too short ${content.length} chars): ${url}`)
                    skipped++
                    return
                }

                const label = `[P${priority}] ${title}`
                process.stdout.write(`  INGEST ${label} (${content.length} chars)\n`)

                try {
                    const result = await ingestPage({
                        title,
                        content,
                        sourceType: 'regulatory',
                        sourceUrl: url,
                        metadata: {
                            priority,
                            section,
                            site: 'bfarm.de',
                            crawledAt: new Date().toISOString(),
                        },
                    })
                    console.log(`    ✓ ${result.chunksCreated ?? '?'} chunks indexed`)
                    ingested++
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err)
                    console.log(`    ✗ Ingest failed: ${message}`)
                    failed++
                }
            })
        )
    }

    // Summary
    console.log('\n─── Summary ──────────────────────────────────────\n')
    console.log(`  ✓ Ingested : ${ingested}`)
    console.log(`  ↷ Skipped  : ${skipped}`)
    console.log(`  ✗ Failed   : ${failed}`)
    console.log(`  Total      : ${discoveredUrls.length}`)
    console.log('\nBfArM RAG ingestion complete.\n')
}

main().catch((err) => {
    console.error('\n[BfArM Crawler] Fatal error:', err)
    process.exit(1)
})
