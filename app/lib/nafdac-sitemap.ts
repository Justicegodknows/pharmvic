/**
 * NAFDAC Sitemap URL Discoverer
 *
 * Parses NAFDAC's WordPress XML sitemaps to produce a prioritised, deduplicated
 * list of URLs for the Zyte crawler. This is far more reliable than link-following
 * because it covers every published post/page — including deep regulatory content.
 *
 * Sitemap index: https://nafdac.gov.ng/sitemap.xml
 *   └── /wp-sitemap-posts-post-1.xml   (all blog posts / press releases / alerts)
 *   └── /wp-sitemap-posts-page-1.xml   (all static pages: services, drugs, guidelines…)
 *
 * Priority tiers (scored 1–3, processed highest first):
 *   3 — Core regulatory pages: /drugs/, /guidelines/, /regulations/, /our-services/,
 *         /narcotics/, /vaccines-biologicals/, /resources/, /export*, /import*
 *   2 — Press releases, alerts, recalls, updates, FAQs, about-nafdac
 *   1 — Everything else on nafdac.gov.ng
 *
 * Excluded patterns (not useful for RAG):
 *   - /author/, /tag/, /page/, /wp-content/, /elementor*
 *   - External links (anything not on nafdac.gov.ng)
 *   - Sitemap files themselves
 */

const NAFDAC_BASE = 'https://nafdac.gov.ng'

const SITEMAP_INDEX = `${NAFDAC_BASE}/sitemap.xml`

// Sitemaps to crawl (from sitemap index — posts + pages only; skip taxonomies/users)
const TARGET_SITEMAPS = [
    `${NAFDAC_BASE}/wp-sitemap-posts-post-1.xml`,
    `${NAFDAC_BASE}/wp-sitemap-posts-page-1.xml`,
]

// High-value regulatory path patterns (priority 3)
const REGULATORY_PATTERNS = [
    '/drugs',
    '/narcotics',
    '/vaccines-biologicals',
    '/cosmetics',
    '/chemicals',
    '/food',
    '/veterinary',
    '/resources/guidelines',
    '/resources/nafdac-regulations',
    '/resources/nafdac-tariff',
    '/our-services',
    '/regulatory-resources',
    '/bioequivalence',
    '/traceability',
    '/export',
    '/import',
    '/ports',
    '/foreign-gmp',
    '/inspection-classification',
    '/pharmacovigilance',
    '/clinical-trial',
    '/dossier',
    '/product-registration',
    '/frequently-asked-questions',
    '/watchlist-blacklist',
]

// Medium-value informational patterns (priority 2)
const INFORMATIONAL_PATTERNS = [
    '/press-release',
    '/recalls-and-alerts',
    '/public-alert',
    '/blacklist',
    '/safety-alert',
    '/about-nafdac',
    '/nafdac-laws',
    '/category',
    '/msme',
]

// URL path segments to skip — these add no RAG value
const SKIP_PATTERNS = [
    '/author/',
    '/tag/',
    '/page/',
    '/wp-content/',
    '/wp-admin/',
    '/elementor',
    '/feed',
    '/sitemap',
    '.xml',
    '.pdf',
    '.jpg',
    '.png',
    '.gif',
    '.webp',
]

export type DiscoveredUrl = {
    url: string
    priority: 1 | 2 | 3
    lastmod?: string
}

/**
 * Fetch and parse a WordPress XML sitemap, returning all `<loc>` values.
 */
async function parseSitemap(sitemapUrl: string): Promise<Array<{ loc: string; lastmod?: string }>> {
    let text: string
    try {
        const res = await fetch(sitemapUrl, {
            headers: { 'User-Agent': 'PharmConnect-RAG-Crawler/1.0 (+https://nafdac.gov.ng)' },
            signal: AbortSignal.timeout(15_000),
        })
        if (!res.ok) {
            console.warn(`  [Sitemap] ${res.status} for ${sitemapUrl}`)
            return []
        }
        text = await res.text()
    } catch (err) {
        console.warn(`  [Sitemap] Fetch failed for ${sitemapUrl}: ${err}`)
        return []
    }

    // Simple regex XML parse — avoids dependency on a full XML parser
    const entries: Array<{ loc: string; lastmod?: string }> = []
    const urlBlocks = text.split(/<url>/).slice(1)

    for (const block of urlBlocks) {
        const locMatch = block.match(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/)
        const lastmodMatch = block.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/)
        if (locMatch?.[1]) {
            entries.push({
                loc: locMatch[1].trim(),
                lastmod: lastmodMatch?.[1]?.trim(),
            })
        }
    }

    return entries
}

/**
 * Score a URL for RAG relevance. Returns null if the URL should be skipped.
 */
function scoreUrl(url: string): 1 | 2 | 3 | null {
    const path = url.replace(NAFDAC_BASE, '').toLowerCase()

    // Skip non-NAFDAC or excluded patterns
    if (!url.startsWith(NAFDAC_BASE)) return null
    if (SKIP_PATTERNS.some((p) => path.includes(p))) return null

    // Highest priority: regulatory core content
    if (REGULATORY_PATTERNS.some((p) => path.startsWith(p))) return 3

    // Medium priority: informational content
    if (INFORMATIONAL_PATTERNS.some((p) => path.includes(p))) return 2

    // Low priority: everything else on NAFDAC
    return 1
}

/**
 * Discover all crawlable NAFDAC URLs from the WordPress sitemap,
 * scored by RAG relevance and sorted highest-priority first.
 *
 * @param maxUrls  Optional cap on total URLs returned (default: unlimited)
 * @param minPriority  Only return URLs with this priority or higher (default: 1)
 */
export async function discoverNafdacUrls(options?: {
    maxUrls?: number
    minPriority?: 1 | 2 | 3
}): Promise<DiscoveredUrl[]> {
    const { maxUrls, minPriority = 1 } = options ?? {}

    console.log(`[Discovery] Fetching sitemaps from ${SITEMAP_INDEX}`)

    const seen = new Set<string>()
    const discovered: DiscoveredUrl[] = []

    for (const sitemapUrl of TARGET_SITEMAPS) {
        console.log(`[Discovery] Parsing ${sitemapUrl}`)
        const entries = await parseSitemap(sitemapUrl)
        console.log(`[Discovery] → ${entries.length} URLs found`)

        for (const entry of entries) {
            if (seen.has(entry.loc)) continue
            seen.add(entry.loc)

            const priority = scoreUrl(entry.loc)
            if (priority === null || priority < minPriority) continue

            discovered.push({ url: entry.loc, priority, lastmod: entry.lastmod })
        }
    }

    // Sort: highest priority first, then most recently modified
    discovered.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority
        if (a.lastmod && b.lastmod) return b.lastmod.localeCompare(a.lastmod)
        return 0
    })

    const result = maxUrls ? discovered.slice(0, maxUrls) : discovered

    const p3 = result.filter((u) => u.priority === 3).length
    const p2 = result.filter((u) => u.priority === 2).length
    const p1 = result.filter((u) => u.priority === 1).length

    console.log(`[Discovery] Total discoverable: ${discovered.length}`)
    console.log(`[Discovery] After cap (${maxUrls ?? 'none'}): ${result.length} URLs`)
    console.log(`[Discovery] Priority 3 (regulatory): ${p3}`)
    console.log(`[Discovery] Priority 2 (informational): ${p2}`)
    console.log(`[Discovery] Priority 1 (general): ${p1}`)

    return result
}
