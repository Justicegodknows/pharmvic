/**
 * Nigerian Customs Service Zyte Crawler — RAG Ingestion Pipeline
 *
 * Crawls https://customs.gov.ng/ using the Zyte API, extracts regulatory
 * content about importation procedures, prohibited items, tariffs, and
 * clearance processes, then indexes everything in Docker PostgreSQL (pgvector).
 *
 * customs.gov.ng is a WordPress site without an XML sitemap. This script
 * uses a curated URL list and tries article autoextract first; on failure,
 * falls back to browser HTML + tag stripping.
 *
 * Pipeline:
 *   URL Discovery (curated list) → Zyte Extract → Plain text → Chunk → Embed → pgvector
 *
 * Run with:
 *   npm run crawl:customs:zyte
 *
 * Required environment variables (.env.local):
 *   ZYTE_API_KEY          — Zyte API key
 *   RAG_ADMIN_API_KEY     — Admin key for POST /api/agent/knowledge
 *   NEXT_PUBLIC_APP_URL   — Base URL of the running Next.js app (default: http://localhost:3000)
 *
 * Optional:
 *   CUSTOMS_MAX_PAGES     — Maximum pages to ingest (default: 80)
 *   CUSTOMS_MIN_PRIORITY  — Minimum URL priority tier 1–3 (default: 2)
 *   CUSTOMS_CONCURRENCY   — Parallel Zyte API requests (default: 3)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { discoverCustomsUrls } from './customs-sitemap'
import { ZyteClient } from './zyte-client'

// ─── Configuration ──────────────────────────────────────────────────────────

const ZYTE_API_KEY = process.env.ZYTE_API_KEY ?? ''
const RAG_ADMIN_API_KEY = process.env.RAG_ADMIN_API_KEY ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const INGEST_ENDPOINT = `${BASE_URL}/api/agent/knowledge`

const MAX_PAGES = parseInt(process.env.CUSTOMS_MAX_PAGES ?? '80', 10)
const MIN_PRIORITY = parseInt(process.env.CUSTOMS_MIN_PRIORITY ?? '2', 10) as 1 | 2 | 3
const CONCURRENCY = parseInt(process.env.CUSTOMS_CONCURRENCY ?? '3', 10)
const MIN_CONTENT_LENGTH = 200

// ─── Validation ──────────────────────────────────────────────────────────────

function validateEnv(): void {
    const missing: string[] = []
    if (!ZYTE_API_KEY) missing.push('ZYTE_API_KEY')
    if (!RAG_ADMIN_API_KEY) missing.push('RAG_ADMIN_API_KEY')
    if (missing.length > 0) {
        console.error(`\n[Customs Crawler] Missing required environment variables:`)
        for (const v of missing) console.error(`  - ${v}`)
        console.error('\nAdd them to .env.local and try again.\n')
        process.exit(1)
    }
}

// ─── HTML → plain text ───────────────────────────────────────────────────────

function htmlToPlainText(html: string): string {
    return html
        .replace(/<(script|style|nav|footer|header|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
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
    console.log('║  Nigerian Customs Zyte Crawler — RAG Ingestion   ║')
    console.log('╚══════════════════════════════════════════════════╝\n')
    console.log(`Target        : https://customs.gov.ng/`)
    console.log(`Max pages     : ${MAX_PAGES}`)
    console.log(`Min priority  : ${MIN_PRIORITY} (1=all, 2=informational+regulatory, 3=regulatory only)`)
    console.log(`Concurrency   : ${CONCURRENCY} parallel Zyte requests`)
    console.log(`Ingest URL    : ${INGEST_ENDPOINT}\n`)

    console.log('─── Step 1: URL Discovery ────────────────────────\n')
    const discoveredUrls = discoverCustomsUrls({ maxUrls: MAX_PAGES, minPriority: MIN_PRIORITY })
    console.log(`\nWill crawl ${discoveredUrls.length} URLs\n`)

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

                // Try article autoextract first
                const article = await zyte.extractArticle(url)

                if (article?.articleBody && article.articleBody.length >= MIN_CONTENT_LENGTH) {
                    title = article.headline ?? section
                    content = article.articleBody
                } else {
                    // Fall back to browser HTML + tag stripping
                    const html = await zyte.extract({ url, browserHtml: true, geolocation: 'NG' })
                        .then((r) => r.browserHtml ?? null)
                        .catch(() => null)

                    if (!html) {
                        console.log(`  SKIP (fetch failed): ${url}`)
                        skipped++
                        return
                    }

                    content = htmlToPlainText(html)

                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
                    title = titleMatch
                        ? titleMatch[1]
                            .replace(/\s*[-|–]\s*Nigeria Customs.*$/i, '')
                            .replace(/\s*[-|–]\s*NCS.*$/i, '')
                            .trim()
                        : section
                }

                if (content.length < MIN_CONTENT_LENGTH) {
                    console.log(`  SKIP (too short ${content.length} chars): ${url}`)
                    skipped++
                    return
                }

                // Skip 404 / error pages and WordPress media attachment pages
                const ERROR_TITLES = /^(page not found|404|not found|error|access denied|forbidden|dsc_|img_|photo_)/i
                const ERROR_CONTENT = /(page not found|404 not found|the page you requested could not be found)/i
                if (ERROR_TITLES.test(title.trim()) || ERROR_CONTENT.test(content.slice(0, 500))) {
                    console.log(`  SKIP (404/error page): ${url}`)
                    skipped++
                    return
                }

                process.stdout.write(`  INGEST [P${priority}] ${title} (${content.length} chars)\n`)

                try {
                    const result = await ingestPage({
                        title,
                        content,
                        sourceType: 'regulatory',
                        sourceUrl: url,
                        metadata: {
                            priority,
                            section,
                            site: 'customs.gov.ng',
                            country: 'Nigeria',
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

    console.log('\n─── Summary ──────────────────────────────────────\n')
    console.log(`  ✓ Ingested : ${ingested}`)
    console.log(`  ↷ Skipped  : ${skipped}`)
    console.log(`  ✗ Failed   : ${failed}`)
    console.log(`  Total      : ${discoveredUrls.length}`)
    console.log('\nNigerian Customs RAG ingestion complete.\n')
}

main().catch((err) => {
    console.error('\n[Customs Crawler] Fatal error:', err)
    process.exit(1)
})
