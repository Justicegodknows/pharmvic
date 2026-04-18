'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2Icon, CircleIcon, ExternalLinkIcon } from 'lucide-react'
import { useCallback, useState, type ReactElement } from 'react'

type ChecklistItem = {
    id: string
    label: string
    description: string
    authority: string
    completed: boolean
    link?: string
}

type Phase = {
    id: string
    title: string
    subtitle: string
    items: ChecklistItem[]
}

const PHASES: Phase[] = [
    {
        id: 'pre-import',
        title: 'Phase 1 — Pre-Import Eligibility',
        subtitle: 'Confirm your organisation and products are eligible to import pharmaceuticals into Nigeria.',
        items: [
            {
                id: 'nafdac-reg',
                label: 'NAFDAC Product Registration',
                description:
                    'Every pharmaceutical product must be registered with NAFDAC before it can be legally imported. Submit dossiers through the NAFDAC SON portal. Registration numbers must appear on all labels.',
                authority: 'NAFDAC',
                completed: false,
                link: 'https://www.nafdac.gov.ng/our-services/',
            },
            {
                id: 'nafdac-import-permit',
                label: 'NAFDAC Import Permit',
                description:
                    'Obtain a product-specific import permit from NAFDAC. The permit covers the specific batch, quantity, and port of entry. Permits must be renewed for each shipment or period.',
                authority: 'NAFDAC',
                completed: false,
                link: 'https://www.nafdac.gov.ng/drugs/',
            },
            {
                id: 'cac-registration',
                label: 'CAC Business Registration',
                description:
                    'Importing company must be registered with the Corporate Affairs Commission (CAC) as a legal entity in Nigeria.',
                authority: 'CAC',
                completed: false,
                link: 'https://www.cac.gov.ng/',
            },
            {
                id: 'tin-tax',
                label: 'Tax Identification Number (TIN)',
                description:
                    'A valid TIN issued by the Federal Inland Revenue Service (FIRS) is required to file customs entries and open a Form M.',
                authority: 'FIRS',
                completed: false,
            },
        ],
    },
    {
        id: 'pre-shipment',
        title: 'Phase 2 — Pre-Shipment Documentation',
        subtitle: 'Prepare all commercial and regulatory documents before the goods leave the exporting country.',
        items: [
            {
                id: 'form-m',
                label: 'Form M (Foreign Exchange)',
                description:
                    'Open a Form M with your commercial bank before shipment. This CBN-mandated document authorises foreign exchange for the import transaction. Valid for 6 months; must be linked to the LC or Bill for Collection.',
                authority: 'CBN / Commercial Bank',
                completed: false,
                link: 'https://www.cbn.gov.ng/',
            },
            {
                id: 'supplier-invoice',
                label: 'Commercial Invoice (Supplier)',
                description:
                    'Obtain a detailed invoice from the German manufacturer showing: full description of goods, HS codes (ECOWAS CET), unit prices, total value in invoice currency, Incoterms, and country of origin.',
                authority: 'Supplier',
                completed: false,
            },
            {
                id: 'packing-list',
                label: 'Packing List',
                description:
                    'Detailed packing list must match the commercial invoice exactly — including carton count, gross/net weights, dimensions, and batch/lot numbers for each pharmaceutical line item.',
                authority: 'Supplier',
                completed: false,
            },
            {
                id: 'coa',
                label: 'Certificate of Analysis (CoA)',
                description:
                    'CoA from the manufacturer\'s QC laboratory for each product batch, showing test parameters and results confirming compliance with the registered specifications.',
                authority: 'Manufacturer',
                completed: false,
            },
            {
                id: 'gmp-cert',
                label: 'GMP / WHO-GMP Certificate',
                description:
                    'Valid GMP certificate of the manufacturing site issued by the national medicines authority (e.g. BfArM for Germany). WHO-GMP certificates are required for products on the essential medicines list.',
                authority: 'BfArM / WHO',
                completed: false,
                link: 'https://www.bfarm.de/EN/Medicinal-products/Licensing/_node.html',
            },
            {
                id: 'free-sale-cert',
                label: 'Certificate of Free Sale (CFS)',
                description:
                    'A CFS from the BfArM or German federal authority confirming the product is approved for sale in Germany and is not subject to export restriction.',
                authority: 'BfArM',
                completed: false,
                link: 'https://www.bfarm.de/EN/Medicinal-products/Licensing/Issues-relevant-for-licensing/Information-WHO-Certificates/_node.html',
            },
            {
                id: 'soncap',
                label: 'SONCAP Certificate (SON)',
                description:
                    'Standards Organisation of Nigeria Conformity Assessment Programme (SONCAP) certificate required for regulated products. Obtain from an approved Conformity Assessment Body (CAB) in the exporting country.',
                authority: 'SON',
                completed: false,
                link: 'https://www.son.gov.ng/',
            },
        ],
    },
    {
        id: 'shipping',
        title: 'Phase 3 — Shipping & Freight',
        subtitle: 'Secure freight documentation and arrange compliant shipping conditions for pharmaceutical cargo.',
        items: [
            {
                id: 'bill-of-lading',
                label: 'Bill of Lading / Airway Bill',
                description:
                    'Original Bill of Lading (sea) or Airway Bill (air) from the carrier. Must match the Form M details exactly — shipper, consignee, goods description, and port of entry.',
                authority: 'Freight Carrier',
                completed: false,
            },
            {
                id: 'cold-chain',
                label: 'Cold Chain / Special Handling Declaration',
                description:
                    'For temperature-sensitive pharmaceuticals, obtain documentation of storage conditions (2–8°C refrigerated / room temperature) and ensure the freight forwarder is certified for pharmaceutical cold chain logistics.',
                authority: 'Freight Forwarder',
                completed: false,
            },
            {
                id: 'insurance',
                label: 'Marine / Cargo Insurance',
                description:
                    'Cargo insurance covering full CIF value of the pharmaceutical shipment is mandatory under Nigerian customs regulations and required for Form M.',
                authority: 'Insurance Company',
                completed: false,
            },
            {
                id: 'pro-forma',
                label: 'Combined Certificate of Value & Origin (CCVO)',
                description:
                    'CCVO or separate Certificate of Origin confirming goods originate from Germany (or the declared country of origin). Required for ECOWAS tariff preference calculations.',
                authority: 'Chamber of Commerce (Germany)',
                completed: false,
            },
        ],
    },
    {
        id: 'paar',
        title: 'Phase 4 — Pre-Arrival Assessment (PAAR)',
        subtitle: 'File the electronic pre-arrival declaration through NICIS II before the vessel arrives at port.',
        items: [
            {
                id: 'paar-filing',
                label: 'Pre-Arrival Assessment Report (PAAR)',
                description:
                    'File the PAAR electronically on the NICIS II platform using all shipping documents. PAAR must be filed before arrival — Nigerian Customs will issue an assessment notice with payable duties. This replaces the old CCVO process.',
                authority: 'Nigerian Customs Service (NCS)',
                completed: false,
                link: 'https://customs.gov.ng/',
            },
            {
                id: 'hs-classification',
                label: 'HS Code Classification',
                description:
                    'Correctly classify all pharmaceutical products under ECOWAS Common External Tariff (CET) HS codes. Common pharmaceutical codes: Chapter 30 (pharma products), 2941 (antibiotics), 3002 (vaccines/blood), 3006 (pharma preparations). Misclassification leads to seizure.',
                authority: 'NCS / Customs Broker',
                completed: false,
                link: 'https://customs.gov.ng/?page_id=3117',
            },
            {
                id: 'duty-calculation',
                label: 'Import Duty & Levy Calculation',
                description:
                    'Calculate all applicable charges: Import Duty (0–20% CET rate for pharma), VAT (7.5% on CIF + duty), Comprehensive Import Supervision Scheme (CISS) levy (1% of FOB), ETLS levy, Port Development Levy, and any applicable ECOWAS levy.',
                authority: 'NCS / Customs Broker',
                completed: false,
            },
            {
                id: 'sgd-filing',
                label: 'Single Goods Declaration (SGD)',
                description:
                    'File the SGD (customs entry) on NICIS II once the PAAR assessment is received. SGD must accurately declare all line items, HS codes, values, and applicable exemptions. A licensed customs agent must endorse the SGD.',
                authority: 'NCS via Licensed Customs Broker',
                completed: false,
                link: 'https://customs.gov.ng/',
            },
        ],
    },
    {
        id: 'clearance',
        title: 'Phase 5 — Port Clearance',
        subtitle: 'Complete duty payment and physical examinations at the port of entry (e.g. Apapa, Tin Can, Lagos Airport).',
        items: [
            {
                id: 'duty-payment',
                label: 'Pay Import Duties & Levies',
                description:
                    'Pay all assessed duties and levies through the government\'s designated payment platform (Remita) using the Assessment Notice number. Keep the e-receipt — it is mandatory for cargo release.',
                authority: 'NCS / Federal Government',
                completed: false,
            },
            {
                id: 'customs-examination',
                label: 'Customs Physical Examination',
                description:
                    'NCS may conduct 100% physical examination, scanning, or document review based on risk profiling. Have all original documents available at the examination bay. Pharmaceutical cargo is typically high-risk and subject to closer inspection.',
                authority: 'NCS',
                completed: false,
            },
            {
                id: 'nafdac-port-clearance',
                label: 'NAFDAC Port Clearance',
                description:
                    'NAFDAC officers at the port will verify the import permit, NAFDAC registration numbers on packaging, CoA, and GMP certificate before issuing port clearance for pharmaceutical cargo. This is separate from customs clearance.',
                authority: 'NAFDAC',
                completed: false,
                link: 'https://www.nafdac.gov.ng/',
            },
            {
                id: 'delivery-order',
                label: 'Terminal Delivery Order',
                description:
                    'Obtain the delivery order from the shipping line/airline after all duties are paid and customs release is granted. Present at the terminal to take delivery of cargo.',
                authority: 'Shipping Line / Terminal',
                completed: false,
            },
            {
                id: 'customs-release',
                label: 'Customs Exit & Release Note',
                description:
                    'NCS issues a Customs Release Note (CRN) confirming duty payment and examination clearance. The CRN is the final document allowing goods to physically exit the port/customs area.',
                authority: 'NCS',
                completed: false,
            },
        ],
    },
    {
        id: 'post-import',
        title: 'Phase 6 — Post-Import Compliance',
        subtitle: 'Maintain regulatory compliance after the goods have entered Nigeria.',
        items: [
            {
                id: 'record-keeping',
                label: 'Import Records Retention (5 Years)',
                description:
                    'Nigerian Customs regulations require all import documentation to be retained for a minimum of 5 years and be available for post-clearance audit. Maintain digital and physical copies of SGD, PAAR, invoices, permits, and duty receipts.',
                authority: 'NCS',
                completed: false,
            },
            {
                id: 'nafdac-distribution',
                label: 'NAFDAC Distribution Compliance',
                description:
                    'All imported pharmaceuticals must be distributed only through NAFDAC-approved channels. Maintain records of distributors, batch numbers, and quantities. Subject to Good Distribution Practice (GDP) inspections.',
                authority: 'NAFDAC',
                completed: false,
            },
            {
                id: 'pharmacovigilance',
                label: 'Pharmacovigilance Reporting',
                description:
                    'Report any adverse drug reactions (ADRs) observed in Nigeria to NAFDAC\'s pharmacovigilance unit. Failure to report is a regulatory violation. File periodic safety update reports for registered products.',
                authority: 'NAFDAC',
                completed: false,
                link: 'https://www.nafdac.gov.ng/our-services/',
            },
        ],
    },
]

// Flat item list for progress calculation
function flatItems(phases: Phase[]): ChecklistItem[] {
    return phases.flatMap((p) => p.items)
}

type ChecklistState = Record<string, boolean>

export default function ChecklistPage(): ReactElement {
    const [completed, setCompleted] = useState<ChecklistState>(() =>
        Object.fromEntries(flatItems(PHASES).map((item) => [item.id, false]))
    )

    const toggle = useCallback((id: string) => {
        setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
    }, [])

    const all = flatItems(PHASES)
    const completedCount = all.filter((i) => completed[i.id]).length
    const progress = Math.round((completedCount / all.length) * 100)

    return (
        <div>
            <h1 className="mb-1 text-2xl font-bold text-foreground">
                Nigerian Pharmaceutical Import Compliance
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Step-by-step checklist covering Nigerian Customs Service (NCS) and NAFDAC requirements
                for importing pharmaceutical products from Germany into Nigeria.
            </p>

            {/* Progress summary */}
            <Card className="mb-8 p-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                        {completedCount} of {all.length} steps completed
                    </span>
                    <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="mt-3 flex flex-wrap gap-2">
                    {PHASES.map((phase) => {
                        const phaseCompleted = phase.items.filter((i) => completed[i.id]).length
                        const phaseDone = phaseCompleted === phase.items.length
                        return (
                            <Badge
                                key={phase.id}
                                variant={phaseDone ? 'default' : 'outline'}
                                className="text-xs"
                            >
                                {phaseDone ? '✓ ' : ''}{phase.title.split('—')[0].trim()}
                            </Badge>
                        )
                    })}
                </div>
            </Card>

            {/* Phases */}
            <div className="space-y-8">
                {PHASES.map((phase) => {
                    const phaseCompleted = phase.items.filter((i) => completed[i.id]).length
                    const phaseTotal = phase.items.length
                    const phasePct = Math.round((phaseCompleted / phaseTotal) * 100)

                    return (
                        <section key={phase.id}>
                            <div className="mb-1 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-foreground">{phase.title}</h2>
                                <span className="text-xs text-muted-foreground">
                                    {phaseCompleted}/{phaseTotal} ({phasePct}%)
                                </span>
                            </div>
                            <p className="mb-3 text-xs text-muted-foreground">{phase.subtitle}</p>
                            <Progress value={phasePct} className="mb-4 h-1" />

                            <div className="space-y-2">
                                {phase.items.map((item) => {
                                    const done = completed[item.id]
                                    return (
                                        <Card
                                            key={item.id}
                                            className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                                            onClick={() => toggle(item.id)}
                                        >
                                            {done ? (
                                                <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                            ) : (
                                                <CircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className={`text-sm font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                        {item.label}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {item.authority}
                                                    </Badge>
                                                    {item.link && (
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Official source
                                                            <ExternalLinkIcon className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}
            </div>

            {/* Prohibited items callout */}
            <Card className="mt-8 border-destructive/30 bg-destructive/5 p-5">
                <h3 className="mb-2 text-sm font-semibold text-destructive">
                    Nigerian Customs — Prohibited & Restricted Pharmaceutical Imports
                </h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• <strong>Counterfeit / substandard medicines</strong> — absolute prohibition; seizure and criminal prosecution under NAFDAC Act Cap N1</li>
                    <li>• <strong>Unregistered pharmaceutical products</strong> — all drugs without a valid NAFDAC registration number are prohibited from import</li>
                    <li>• <strong>Narcotics and psychotropic substances</strong> — controlled under the NDLEA Act; require a separate import licence from NAFDAC Narcotics division</li>
                    <li>• <strong>Expired or near-expiry products</strong> — products with shelf life less than 60% remaining at the time of import are rejected at the port</li>
                    <li>• <strong>Products from blacklisted manufacturers</strong> — NAFDAC maintains a watchlist of manufacturers banned from exporting to Nigeria</li>
                    <li>• <strong>Re-labelled or re-packaged goods</strong> — original manufacturer packaging required; secondary re-packing without NAFDAC approval is prohibited</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                    Source: <a href="https://customs.gov.ng/?page_id=3117" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NCS Functions</a> · <a href="https://www.nafdac.gov.ng/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NAFDAC</a>
                </p>
            </Card>

            {/* Duty rates callout */}
            <Card className="mt-4 border-blue-500/30 bg-blue-500/5 p-5">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                    Common Import Duty Rates for Pharmaceuticals (ECOWAS CET)
                </h3>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    {[
                        { hs: 'Chapter 30', desc: 'Pharmaceutical products', rate: '0%' },
                        { hs: '2941', desc: 'Antibiotics (bulk API)', rate: '5%' },
                        { hs: '3002', desc: 'Vaccines, blood products', rate: '0%' },
                        { hs: '3003–3004', desc: 'Medicaments (retail packs)', rate: '5–10%' },
                        { hs: '3006', desc: 'Pharma preparations/dressings', rate: '5%' },
                        { hs: '9018', desc: 'Medical devices / instruments', rate: '5–10%' },
                    ].map((row) => (
                        <div key={row.hs} className="flex justify-between gap-2 rounded bg-muted/50 px-3 py-1.5">
                            <span className="font-mono text-muted-foreground">{row.hs}</span>
                            <span className="text-muted-foreground">{row.desc}</span>
                            <span className="font-semibold text-foreground">{row.rate}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Additional levies: 7.5% VAT on (CIF + duty) · 1% CISS on FOB · Port Development Levy · ETLS where applicable.
                    Rates subject to change — verify current CET schedule before filing.
                </p>
            </Card>

            <p className="mt-6 text-xs text-muted-foreground">
                This checklist is compiled from Nigerian Customs Service (NCS) and NAFDAC official guidelines.
                Regulations are subject to change. Consult a licensed Nigerian customs broker or regulatory consultant
                for transaction-specific advice.
            </p>
        </div>
    )
}

