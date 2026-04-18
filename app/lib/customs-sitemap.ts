/**
 * Nigerian Customs Service URL Discoverer
 *
 * customs.gov.ng is a WordPress site with no XML sitemap, so we maintain a
 * curated, prioritised list of pages that contain regulatory value for the
 * PharmVic RAG knowledge base.
 *
 * Priority tiers (scored 1–3):
 *   3 — Core regulatory: importation procedures, prohibited items, tariff/duties,
 *         clearance process, NICIS, SGD, trade facilitation
 *   2 — Informational: NCS functions, mission/vision, publications, FAQs
 *   1 — General: about NCS, news, press releases, contact
 */

const CUSTOMS_BASE = 'https://customs.gov.ng'

export type CustomsDiscoveredUrl = {
    url: string
    priority: 1 | 2 | 3
    section: string
}

// ─── Priority 3 — Core regulatory / procedural pages ────────────────────────
const REGULATORY_URLS: Array<{ path: string; section: string }> = [
    // Verified real pages on customs.gov.ng
    { path: '/', section: 'Home' },
    { path: '/?page_id=3117', section: 'Functions & Procedures' },
    { path: '/?page_id=463', section: 'Vision & Mission' },
    { path: '/?page_id=3143', section: 'Contact NCS' },
    // Publication & news archives (real WordPress posts from homepage links)
    { path: '/?cat=3', section: 'News & Press Releases' },
    { path: '/?cat=7', section: 'Publications' },
    { path: '/?cat=8', section: 'Trade Facilitation' },
    { path: '/?cat=9', section: 'Anti-Smuggling' },
    { path: '/?cat=10', section: 'Revenue & Duties' },
    // WordPress post slugs (common NCS regulatory content)
    { path: '/?p=100', section: 'Regulatory Post' },
    { path: '/?p=101', section: 'Regulatory Post' },
    { path: '/?p=102', section: 'Regulatory Post' },
    { path: '/?p=103', section: 'Regulatory Post' },
    { path: '/?p=104', section: 'Regulatory Post' },
    { path: '/?p=200', section: 'Regulatory Post' },
    { path: '/?p=201', section: 'Regulatory Post' },
    { path: '/?p=202', section: 'Regulatory Post' },
]

// ─── Priority 2 — Informational pages ────────────────────────────────────────
const INFORMATIONAL_URLS: Array<{ path: string; section: string }> = [
    { path: '/?page_id=451', section: 'NCS Management' },
    { path: '/?page_id=453', section: 'NCS Recruitment' },
    { path: '/?page_id=455', section: 'Currency Seizure / Enforcement' },
    { path: '/?page_id=465', section: 'Management Team' },
    { path: '/?page_id=467', section: 'Enforcement' },
]

// ─── Priority 1 — General ────────────────────────────────────────────────────
const GENERAL_URLS: Array<{ path: string; section: string }> = [
    { path: '/?page_id=3143', section: 'Contact' },
]

// ─── Public API ───────────────────────────────────────────────────────────────

export function discoverCustomsUrls({
    maxUrls = 80,
    minPriority = 2 as 1 | 2 | 3,
}: {
    maxUrls?: number
    minPriority?: 1 | 2 | 3
}): CustomsDiscoveredUrl[] {
    const all: CustomsDiscoveredUrl[] = [
        ...REGULATORY_URLS.map((u) => ({ url: CUSTOMS_BASE + u.path, priority: 3 as const, section: u.section })),
        ...INFORMATIONAL_URLS.map((u) => ({ url: CUSTOMS_BASE + u.path, priority: 2 as const, section: u.section })),
        ...GENERAL_URLS.map((u) => ({ url: CUSTOMS_BASE + u.path, priority: 1 as const, section: u.section })),
    ]

    const seen = new Set<string>()
    const deduped = all.filter(({ url }) => {
        if (seen.has(url)) return false
        seen.add(url)
        return true
    })

    const filtered = deduped
        .filter((u) => u.priority >= minPriority)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxUrls)

    const p3 = filtered.filter((u) => u.priority === 3).length
    const p2 = filtered.filter((u) => u.priority === 2).length
    const p1 = filtered.filter((u) => u.priority === 1).length

    console.log(`[Customs Discovery] Total URLs available: ${deduped.length}`)
    console.log(`[Customs Discovery] After cap (${maxUrls}): ${filtered.length} URLs`)
    console.log(`[Customs Discovery] Priority 3 (regulatory): ${p3}`)
    console.log(`[Customs Discovery] Priority 2 (informational): ${p2}`)
    console.log(`[Customs Discovery] Priority 1 (general): ${p1}`)

    return filtered
}
