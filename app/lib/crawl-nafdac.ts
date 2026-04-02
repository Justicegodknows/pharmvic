/**
 * NAFDAC Website Crawler & RAG Ingestion Script
 *
 * Uses Firecrawl to crawl https://nafdac.gov.ng/ and ingest each page
 * into the RAG knowledge base via the /api/agent/knowledge endpoint.
 *
 * Run with: npx tsx app/lib/crawl-nafdac.ts
 *
 * Requires environment variables:
 *   FIRECRAWL_API_KEY          — Firecrawl API key
 *   RAG_ADMIN_API_KEY          — Admin key for the knowledge ingest endpoint
 *   NEXT_PUBLIC_APP_URL        — Base URL of the running app (default: http://localhost:3000)
 */

import { crawlAndIngest } from '@/app/lib/crawl-site'

crawlAndIngest({
    name: 'NAFDAC',
    url: 'https://nafdac.gov.ng/',
    sourceType: 'regulatory',
    maxPages: 50,
}).catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
})
