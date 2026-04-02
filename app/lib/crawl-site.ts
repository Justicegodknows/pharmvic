/**
 * Reusable Firecrawl → RAG ingestion helper.
 *
 * Each site-specific script (crawl-nafdac.ts, crawl-customs.ts, …)
 * calls `crawlAndIngest()` with a site config. This module owns all
 * Firecrawl interaction and knowledge-endpoint posting.
 *
 * Requires environment variables:
 *   FIRECRAWL_API_KEY, RAG_ADMIN_API_KEY, NEXT_PUBLIC_APP_URL
 */

import FirecrawlApp from '@mendable/firecrawl-js'

export type CrawlSiteConfig = {
    /** Human-readable label used in logs and as title fallback */
    name: string
    /** Root URL to crawl */
    url: string
    /** Source type tag stored in the knowledge base */
    sourceType: 'regulatory' | 'platform' | 'web' | 'upload'
    /** Maximum pages to crawl (default 50) */
    maxPages?: number
    /** Minimum content length to keep a page (default 200) */
    minContentLength?: number
}

export async function crawlAndIngest(config: CrawlSiteConfig): Promise<void> {
    const {
        name,
        url,
        sourceType,
        maxPages = 50,
        minContentLength = 200,
    } = config

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY
    if (!firecrawlApiKey) {
        console.error('FIRECRAWL_API_KEY is required. Set it in .env.local')
        process.exit(1)
    }

    const ragApiKey = process.env.RAG_ADMIN_API_KEY
    if (!ragApiKey) {
        console.error('RAG_ADMIN_API_KEY is required. Set it in .env.local')
        process.exit(1)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    console.log(`=== ${name} Website Crawler ===`)
    console.log(`Target: ${url}`)
    console.log(`Max pages: ${maxPages}`)
    console.log(`Ingest endpoint: ${baseUrl}/api/agent/knowledge\n`)

    // --- Step 1: Crawl with Firecrawl ---
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey })

    console.log('Starting crawl...')
    const crawlJob = await firecrawl.crawl(url, {
        limit: maxPages,
        scrapeOptions: {
            formats: ['markdown'],
        },
    })

    if (crawlJob.status === 'failed' || crawlJob.status === 'cancelled') {
        console.error('Crawl failed with status:', crawlJob.status)
        process.exit(1)
    }

    const pages = crawlJob.data ?? []
    console.log(`Crawl complete — ${pages.length} pages returned\n`)

    // --- Step 2: Filter & Ingest ---
    let ingested = 0
    let skipped = 0
    const errors: string[] = []

    for (const page of pages) {
        const content = page.markdown?.trim()
        const sourceUrl = page.metadata?.sourceURL ?? ''
        const title =
            page.metadata?.title?.trim() ||
            `${name} — ${new URL(sourceUrl || url).pathname}`

        if (!content || content.length < minContentLength) {
            skipped++
            console.log(`SKIP (too short): ${title}`)
            continue
        }

        console.log(`Ingesting: ${title} (${content.length} chars)`)

        try {
            const response = await fetch(`${baseUrl}/api/agent/knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ragApiKey,
                },
                body: JSON.stringify({
                    title,
                    content,
                    sourceType,
                    sourceUrl: sourceUrl || url,
                    metadata: {
                        crawler: 'firecrawl',
                        crawledAt: new Date().toISOString(),
                        description: page.metadata?.description ?? '',
                    },
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                errors.push(`${title}: ${response.status} — ${errorText}`)
                console.error(`  ERROR: ${response.status} — ${errorText}`)
            } else {
                const result = (await response.json()) as { chunksCreated?: number }
                console.log(`  OK — ${result.chunksCreated ?? '?'} chunks created`)
                ingested++
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            errors.push(`${title}: ${message}`)
            console.error(`  ERROR: ${message}`)
        }
    }

    // --- Summary ---
    console.log('\n=== Summary ===')
    console.log(`Pages crawled : ${pages.length}`)
    console.log(`Ingested      : ${ingested}`)
    console.log(`Skipped       : ${skipped}`)
    console.log(`Errors        : ${errors.length}`)

    if (errors.length > 0) {
        console.log('\nError details:')
        for (const e of errors) {
            console.log(`  - ${e}`)
        }
    }
}
