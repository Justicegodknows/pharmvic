/**
 * NAFDAC Zyte Crawler — RAG Ingestion Pipeline
 *
 * Uses Zyte API (https://docs.zyte.com/) to crawl the NAFDAC website,
 * extract clean article content, chunk it, generate embeddings with Ollama,
 * and index everything in Docker PostgreSQL (pgvector) for RAG retrieval.
 *
 * Pipeline:
 *   Sitemap Discovery → Zyte Article Extraction → Chunk → Embed → pgvector
 *
 * Run with:
 *   npm run crawl:nafdac:zyte
 *
 * Required environment variables (.env.local):
 *   ZYTE_API_KEY          — Zyte API key (get from https://app.zyte.com/)
 *   RAG_ADMIN_API_KEY     — Admin key for POST /api/agent/knowledge
 *   NEXT_PUBLIC_APP_URL   — Base URL of the running Next.js app (default: http://localhost:3000)
 *
 * Optional:
 *   NAFDAC_MAX_PAGES      — Maximum pages to ingest (default: 200)
 *   NAFDAC_MIN_PRIORITY   — Minimum URL priority tier 1-3 (default: 2 = informational+regulatory)
 *   NAFDAC_CONCURRENCY    — Parallel Zyte API requests (default: 5)
 *
 * Notes:
 * - The app dev server (npm run dev) must be running before executing this script
 *   so that /api/agent/knowledge is reachable.
 * - Pages already ingested are skipped automatically (the API route handles dedup
 *   at the knowledge_documents level via source_url).
 * - Zyte API credits are consumed per URL; keep NAFDAC_MAX_PAGES reasonable.
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local (Next.js convention) — dotenv/config only reads .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') }) // fallback
import { discoverNafdacUrls } from './nafdac-sitemap'
import { ZyteClient } from './zyte-client'

// ─── Configuration ─────────────────────────────────────────────────────────

const ZYTE_API_KEY = process.env.ZYTE_API_KEY ?? ''
const RAG_ADMIN_API_KEY = process.env.RAG_ADMIN_API_KEY ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const INGEST_ENDPOINT = `${BASE_URL}/api/agent/knowledge`

const MAX_PAGES = parseInt(process.env.NAFDAC_MAX_PAGES ?? '200', 10)
const MIN_PRIORITY = (parseInt(process.env.NAFDAC_MIN_PRIORITY ?? '2', 10) as 1 | 2 | 3)
const CONCURRENCY = parseInt(process.env.NAFDAC_CONCURRENCY ?? '5', 10)
const MIN_CONTENT_LENGTH = 200

// ─── Validation ─────────────────────────────────────────────────────────────

function validateEnv(): void {
    const missing: string[] = []
    if (!ZYTE_API_KEY) missing.push('ZYTE_API_KEY')
    if (!RAG_ADMIN_API_KEY) missing.push('RAG_ADMIN_API_KEY')

    if (missing.length > 0) {
        console.error(`\n[NAFDAC Zyte Crawler] Missing required environment variables:`)
        for (const v of missing) {
            console.error(`  - ${v}`)
        }
        console.error('\nAdd them to .env.local and try again.\n')
        process.exit(1)
    }
}

// ─── Ingest a single page via the knowledge API ───────────────────────────

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
        throw new Error(`Ingest API ${res.status}: ${text.slice(0, 200)}`)
    }

    return res.json() as Promise<IngestResponse>
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    validateEnv()

    console.log('\n╔══════════════════════════════════════════════════╗')
    console.log('║      NAFDAC Zyte Crawler — RAG Ingestion         ║')
    console.log('╚══════════════════════════════════════════════════╝\n')
    console.log(`Target        : https://nafdac.gov.ng/`)
    console.log(`Max pages     : ${MAX_PAGES}`)
    console.log(`Min priority  : ${MIN_PRIORITY} (1=all, 2=informational+regulatory, 3=regulatory only)`)
    console.log(`Concurrency   : ${CONCURRENCY} parallel Zyte requests`)
    console.log(`Ingest URL    : ${INGEST_ENDPOINT}\n`)

    // Step 1: Discover URLs from NAFDAC WordPress sitemaps
    console.log('─── Step 1: URL Discovery ────────────────────────\n')
    const discoveredUrls = await discoverNafdacUrls({
        maxUrls: MAX_PAGES,
        minPriority: MIN_PRIORITY,
    })

    if (discoveredUrls.length === 0) {
        console.log('No URLs discovered. Check network connectivity.')
        process.exit(1)
    }

    console.log(`\nWill crawl ${discoveredUrls.length} URLs\n`)

    // Step 2: Extract + ingest pages via Zyte API
    console.log('─── Step 2: Extraction & Ingestion ──────────────\n')

    const client = new ZyteClient(ZYTE_API_KEY)

    let ingested = 0
    let skipped = 0
    let failed = 0

    const urlList = discoveredUrls.map((u) => u.url)

    for (let i = 0; i < urlList.length; i += CONCURRENCY) {
        const batch = urlList.slice(i, i + CONCURRENCY)
        const batchNum = Math.floor(i / CONCURRENCY) + 1
        const totalBatches = Math.ceil(urlList.length / CONCURRENCY)

        console.log(`\n[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} URLs…`)

        const extractions = await client.extractArticlesBatch(batch, CONCURRENCY)

        for (const { url, article } of extractions) {
            const discoveredEntry = discoveredUrls.find((u) => u.url === url)
            const priority = discoveredEntry?.priority ?? 1

            if (!article || !article.articleBody) {
                console.log(`  SKIP (no article body): ${url}`)
                skipped++
                continue
            }

            const content = article.articleBody.trim()

            if (content.length < MIN_CONTENT_LENGTH) {
                console.log(`  SKIP (too short: ${content.length} chars): ${url}`)
                skipped++
                continue
            }

            const title =
                article.headline?.trim() ||
                `NAFDAC — ${new URL(url).pathname.replace(/\//g, ' ').trim()}`

            console.log(`  INGEST [P${priority}] ${title} (${content.length} chars)`)

            try {
                const result = await ingestPage({
                    title,
                    content,
                    sourceType: 'regulatory',
                    sourceUrl: url,
                    metadata: {
                        crawler: 'zyte-api',
                        crawledAt: new Date().toISOString(),
                        priority,
                        datePublished: article.datePublished ?? null,
                        siteName: article.siteName ?? 'NAFDAC',
                    },
                })

                console.log(`    ✓ ${result.chunksCreated ?? '?'} chunks indexed`)
                ingested++
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                console.error(`    ✗ Ingest failed: ${message}`)
                failed++
            }
        }
    }

    // Step 3: Summary
    console.log('\n╔══════════════════════════════════════════════════╗')
    console.log('║                    Summary                       ║')
    console.log('╠══════════════════════════════════════════════════╣')
    console.log(`║  URLs discovered : ${String(discoveredUrls.length).padEnd(28)}║`)
    console.log(`║  Ingested        : ${String(ingested).padEnd(28)}║`)
    console.log(`║  Skipped         : ${String(skipped).padEnd(28)}║`)
    console.log(`║  Failed          : ${String(failed).padEnd(28)}║`)
    console.log('╚══════════════════════════════════════════════════╝\n')

    if (failed > 0) {
        console.log('Some pages failed to ingest. Re-run to retry.\n')
        process.exit(1)
    }
}

main().catch((err) => {
    console.error('\n[Fatal]', err instanceof Error ? err.message : err)
    process.exit(1)
})
