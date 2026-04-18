/**
 * BfArM (Federal Institute for Drugs and Medical Devices) URL Discoverer
 *
 * BfArM does not publish an XML sitemap, so we maintain a curated list of
 * high-value English pages extracted from the HTML sitemap at:
 *   https://www.bfarm.de/EN/Service/Sitemap/sitemap_node.html
 *
 * Priority tiers (scored 1–3, processed highest first):
 *   3 — Core regulatory: licensing, clinical trials, pharmacovigilance,
 *         narcotic drug imports/exports, medicinal product information
 *   2 — Informational: medical devices, code systems (ICD/ATC/SNOMED),
 *         about BfArM, EU/international collaboration
 *   1 — General: news, events, press, statistics
 *
 * The `geolocation` option is set to "DE" so Zyte routes requests
 * through a German IP — BfArM occasionally geo-restricts content.
 */

const BFARM_BASE = 'https://www.bfarm.de'

export type BfarmDiscoveredUrl = {
    url: string
    priority: 1 | 2 | 3
    section: string
}

// ─── Priority 3 — Core regulatory pages ────────────────────────────────────
const REGULATORY_URLS: Array<{ path: string; section: string }> = [
    // Medicinal products – licensing
    { path: '/EN/Medicinal-products/Licensing/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Types-of-marketing-authorisation/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Types-of-marketing-authorisation/Licensing-of-biosimilars/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Types-of-marketing-authorisation/Bibliographical-application/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Types-of-marketing-authorisation/Complementary-alternative-medicines-and-traditional-medicinal-products/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Licensing-procedures/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Licensing-procedures/CP-Centralised-Procedures/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Licensing-procedures/NLP-National-Licensing-Procedures/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Licensing-procedures/DCP-MRP/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Licensing-procedures/Parallel-Import-Medicinal-Products/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/FollowUp-procedures/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/FollowUp-procedures/Variations/Variations/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Issues-relevant-for-licensing/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Issues-relevant-for-licensing/Information-WHO-Certificates/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Issues-relevant-for-licensing/eSubmission/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Issues-relevant-for-licensing/Pharmacopoeia/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Issues-relevant-for-licensing/Demarcation/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Medicines-for-children/_node.html', section: 'Licensing' },
    { path: '/EN/Medicinal-products/Licensing/Medicines-for-rare-diseases/_node.html', section: 'Licensing' },
    // Pharmacovigilance
    { path: '/EN/Medicinal-products/Pharmacovigilance/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Reporting-risks/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Risk-information/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Risk-information/Rote-Hand-Briefe-and-Information-Letters/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Risk-information/Other-risk-information/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Risk-information/Risk-Assessment-Procedures/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Risk-information/List-of-medicines-under-additional-monitoring/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Risk-information/Risk-Management-Plans-RMP/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Periodic-Safety-Update-Reports_PSURs/_node.html', section: 'Pharmacovigilance' },
    { path: '/EN/Medicinal-products/Pharmacovigilance/Boards-and-committees/PRAC/_node.html', section: 'Pharmacovigilance' },
    // Clinical trials
    { path: '/EN/Medicinal-products/Clinical-trials/_node.html', section: 'Clinical Trials' },
    { path: '/EN/Medicinal-products/Clinical-trials/CTIS-Clinical-Trials-Information-System/_node.html', section: 'Clinical Trials' },
    { path: '/EN/Medicinal-products/Clinical-trials/Compassionate-Use/_node.html', section: 'Clinical Trials' },
    { path: '/EN/Medicinal-products/GCP-Inspections-Unit/_node.html', section: 'GCP' },
    // Medicinal product information
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/_node.html', section: 'Medicinal Products Info' },
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/Supply-shortages/_node.html', section: 'Medicinal Products Info' },
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/Falsified-medicines-directive/_node.html', section: 'Medicinal Products Info' },
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/Rapid-Alert-System/_node.html', section: 'Medicinal Products Info' },
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/Reference-Pricing/_node.html', section: 'Medicinal Products Info' },
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/Online-medicine-retailers/_node.html', section: 'Medicinal Products Info' },
    { path: '/EN/Medicinal-products/Information-on-medicinal-products/Research-medicinal-products/AMIce/_node.html', section: 'Medicinal Products Info' },
    // Federal Opium Agency
    { path: '/EN/Federal-Opium-Agency/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Narcotic-drugs/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Narcotic-drugs/Licences/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Narcotic-drugs/Notifications/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Narcotic-drugs/Records/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Narcotic-drugs/Import-and-Export/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Narcotic-drugs/Travelling-with-narcotic-drugs/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Precursors/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Precursors/Import-and-Export/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Precursors/Licence-and-Registration/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/T-prescriptions/_node.html', section: 'Federal Opium Agency' },
    { path: '/EN/Federal-Opium-Agency/Substitution-register/_node.html', section: 'Federal Opium Agency' },
]

// ─── Priority 2 — Informational pages ──────────────────────────────────────
const INFORMATIONAL_URLS: Array<{ path: string; section: string }> = [
    // Medical devices
    { path: '/EN/Medical-devices/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Overview/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Overview/Basic-information/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Overview/Basic-information/Conformity-assessment/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Overview/Laws-and-ordinances/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Overview/Competent-authorities-and-ethics-committees/Notified-bodies/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/Clinical-investigations-and-performance-studies/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/Risk-assessment-and-research/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/Risk-assessment-and-research/Field-corrective-actions/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/Risk-assessment-and-research/BfArM-recommendations/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/Differentiation-and-classification/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/DiGA-and-DiPA/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/DiGA-and-DiPA/Digital-Health-Applications/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Tasks/FAQ-and-contact-persons/_node.html', section: 'Medical Devices' },
    { path: '/EN/Medical-devices/Applications-and-reports/Incident-report/_node.html', section: 'Medical Devices' },
    // Code systems
    { path: '/EN/Code-systems/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Classifications/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Classifications/ICD/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Classifications/ICD/ICD-10-GM/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Classifications/ICD/ICD-11/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Classifications/ATC/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Classifications/OPS-ICHI/OPS/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Terminologies/SNOMED-CT/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Terminologies/SNOMED-CT/Information-about-SNOMED-CT/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Terminologies/LOINC-UCUM/LOINC-and-RELMA/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Collaboration-and-projects/WHO-Collaborating-Center/_node.html', section: 'Code Systems' },
    { path: '/EN/Code-systems/Services/Terminologyserver/_node.html', section: 'Code Systems' },
    // About BfArM
    { path: '/EN/BfArM/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/Research/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/Research/Pharmacogenomics/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/Research/Pharmacoepidemiology/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/German-Clinical-Trials-Register/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/EU-and-International/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/EU-and-International/CHMP-Committee/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/EU-and-International/International-collaborations/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/EU-and-International/International-collaborations/ICH/_node.html', section: 'About BfArM' },
    { path: '/EN/Medical-research-act/_node.html', section: 'About BfArM' },
    { path: '/EN/News/Topic-dossiers/Antibiotic-resistances/_node.html', section: 'News' },
    { path: '/EN/News/Publications/Annual-reports/_node.html', section: 'News' },
    { path: '/EN/News/Statistics/Marketable-medicinal-products/_node.html', section: 'News' },
]

// ─── Priority 1 — General pages ─────────────────────────────────────────────
const GENERAL_URLS: Array<{ path: string; section: string }> = [
    { path: '/EN/Home/_node.html', section: 'Home' },
    { path: '/EN/News/_node.html', section: 'News' },
    { path: '/EN/News/Press/_node.html', section: 'News' },
    { path: '/EN/News/Statistics/_node.html', section: 'News' },
    { path: '/EN/News/Statistics/Licensing-processing/_node.html', section: 'News' },
    { path: '/EN/News/Statistics/Advice-procedures/_node.html', section: 'News' },
    { path: '/EN/BfArM/Organisation/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/Advice/_node.html', section: 'About BfArM' },
    { path: '/EN/BfArM/Tasks/Data-Access-and-Coordination-Office/_node.html', section: 'About BfArM' },
    { path: '/EN/Code-systems/Collaboration-and-projects/KKG/_node.html', section: 'Code Systems' },
]

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns a prioritised, deduplicated list of BfArM English page URLs
 * up to `maxUrls`, ordered by priority (3 first).
 */
export function discoverBfarmUrls({
    maxUrls = 150,
    minPriority = 2 as 1 | 2 | 3,
}: {
    maxUrls?: number
    minPriority?: 1 | 2 | 3
}): BfarmDiscoveredUrl[] {
    const all: BfarmDiscoveredUrl[] = [
        ...REGULATORY_URLS.map((u) => ({ url: BFARM_BASE + u.path, priority: 3 as const, section: u.section })),
        ...INFORMATIONAL_URLS.map((u) => ({ url: BFARM_BASE + u.path, priority: 2 as const, section: u.section })),
        ...GENERAL_URLS.map((u) => ({ url: BFARM_BASE + u.path, priority: 1 as const, section: u.section })),
    ]

    // Deduplicate by URL
    const seen = new Set<string>()
    const deduped = all.filter(({ url }) => {
        if (seen.has(url)) return false
        seen.add(url)
        return true
    })

    // Filter by min priority and cap
    const filtered = deduped
        .filter((u) => u.priority >= minPriority)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxUrls)

    const p3 = filtered.filter((u) => u.priority === 3).length
    const p2 = filtered.filter((u) => u.priority === 2).length
    const p1 = filtered.filter((u) => u.priority === 1).length

    console.log(`[BfArM Discovery] Total URLs available: ${deduped.length}`)
    console.log(`[BfArM Discovery] After cap (${maxUrls}): ${filtered.length} URLs`)
    console.log(`[BfArM Discovery] Priority 3 (regulatory): ${p3}`)
    console.log(`[BfArM Discovery] Priority 2 (informational): ${p2}`)
    console.log(`[BfArM Discovery] Priority 1 (general): ${p1}`)

    return filtered
}
