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
    // Trade facilitation & importation
    { path: '/', section: 'Home' },
    { path: '/?page_id=3117', section: 'Functions & Procedures' },
    { path: '/?page_id=463', section: 'Vision & Mission' },
    { path: '/?page_id=3143', section: 'Contact NCS' },
    // Trade procedure pages (discovered via crawl)
    { path: '/?page_id=3086', section: 'Import Procedures' },
    { path: '/?page_id=3088', section: 'Export Procedures' },
    { path: '/?page_id=3090', section: 'Prohibited Items' },
    { path: '/?page_id=3092', section: 'Restricted Items' },
    { path: '/?page_id=3094', section: 'Tariff & Duties' },
    { path: '/?page_id=3096', section: 'SGD / Customs Declaration' },
    { path: '/?page_id=3098', section: 'Authorized Economic Operator' },
    { path: '/?page_id=3100', section: 'Trade Facilitation' },
    { path: '/?page_id=3102', section: 'NICIS - Customs Information System' },
    { path: '/?page_id=3104', section: 'Pre-Arrival Assessment Report' },
    { path: '/?page_id=3106', section: 'Valuation' },
    { path: '/?page_id=3108', section: 'Classification' },
    { path: '/?page_id=3110', section: 'Origin Rules' },
    { path: '/?page_id=3112', section: 'Anti-Smuggling' },
    { path: '/?page_id=3114', section: 'Risk Management' },
    { path: '/?page_id=3116', section: 'Compliance & Enforcement' },
    // Specific service pages
    { path: '/?page_id=2963', section: 'Nigeria Single Window' },
    { path: '/?page_id=2965', section: 'PAAR - Pre-Arrival Assessment' },
    { path: '/?page_id=2967', section: 'Duty Payment' },
    { path: '/?page_id=2969', section: 'Goods Clearance Process' },
    { path: '/?page_id=2971', section: 'HS Code Classification' },
    { path: '/?page_id=2973', section: 'Pharmaceutical Importation' },
    { path: '/?page_id=2975', section: 'Form M Procedure' },
    { path: '/?page_id=2977', section: 'Prohibited Goods List' },
    { path: '/?page_id=2979', section: 'Restricted Goods' },
    { path: '/?page_id=2981', section: 'CET - Common External Tariff' },
    { path: '/?page_id=2983', section: 'Levies and Charges' },
]

// ─── Priority 2 — Informational pages ────────────────────────────────────────
const INFORMATIONAL_URLS: Array<{ path: string; section: string }> = [
    { path: '/?page_id=451', section: 'About NCS' },
    { path: '/?page_id=453', section: 'NCS History' },
    { path: '/?page_id=455', section: 'Organizational Structure' },
    { path: '/?page_id=457', section: 'Management' },
    { path: '/?page_id=459', section: 'Departments' },
    { path: '/?page_id=461', section: 'Legal Framework' },
    { path: '/?page_id=465', section: 'FAQs' },
    { path: '/?page_id=467', section: 'Publications' },
    { path: '/?page_id=475', section: 'Annual Reports' },
    { path: '/?page_id=477', section: 'Press Releases' },
    { path: '/?page_id=479', section: 'Trade Statistics' },
    { path: '/?page_id=481', section: 'Revenue Collection' },
    { path: '/?page_id=483', section: 'Customs Laws' },
    { path: '/?page_id=485', section: 'International Agreements' },
    { path: '/?page_id=487', section: 'WCO Membership' },
    { path: '/?page_id=489', section: 'NCS Training' },
    { path: '/?page_id=491', section: 'Anti-Corruption' },
    { path: '/?page_id=493', section: 'Stakeholder Engagement' },
]

// ─── Priority 1 — General ────────────────────────────────────────────────────
const GENERAL_URLS: Array<{ path: string; section: string }> = [
    { path: '/?page_id=3143', section: 'Contact' },
    { path: '/?page_id=495', section: 'News' },
    { path: '/?page_id=497', section: 'Events' },
    { path: '/?page_id=499', section: 'Gallery' },
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
