import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    FileTextIcon,
    ShieldCheckIcon,
    AlertTriangleIcon,
    ChevronDownIcon,
    ExternalLinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'

const REQUIRED_DOCS = [
    'NAFDAC Product Registration Certificate',
    'NAFDAC Import Permit',
    'Form M (Central Bank of Nigeria)',
    'Certificate of Analysis (CoA) from manufacturer',
    'GMP / WHO-GMP Certificate',
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading / Airway Bill',
    'Certificate of Origin',
    'Insurance Certificate',
    'Phytosanitary Certificate (if applicable)',
    'Material Safety Data Sheet (MSDS)',
    'Pre-Arrival Assessment Report (PAAR)',
]

const FAQ_ITEMS = [
    {
        question: 'How long does NAFDAC product registration take?',
        answer: 'NAFDAC product registration typically takes 3–12 months depending on the product category and completeness of documentation. Fast-track options may be available for essential medicines.',
    },
    {
        question: 'What are the customs duties on pharmaceutical imports?',
        answer: 'Pharmaceutical raw materials and essential medicines may attract 0–5% duty under the ECOWAS Common External Tariff (CET). Finished pharmaceutical products typically attract 5–20% duty depending on the HS code classification. Always verify with the latest Nigerian Customs tariff schedule.',
    },
    {
        question: 'Do I need a pharmaceutical import license?',
        answer: 'Yes. Only registered pharmaceutical companies with a valid Premises License from the Pharmacists Council of Nigeria (PCN) and NAFDAC can import pharmaceutical products into Nigeria.',
    },
    {
        question: 'What certifications should I look for in a German supplier?',
        answer: 'Look for GMP (Good Manufacturing Practice), WHO-GMP pre-qualification, ISO 9001 quality management, CE Mark for medical devices, and EU Falsified Medicines Directive compliance. These are verifiable through BfArM (Germany) and EMA (EU).',
    },
    {
        question: 'Can I import controlled substances from Germany?',
        answer: 'Importing controlled substances requires additional permits from both the Nigerian Federal Ministry of Health and the German Federal Institute for Drugs and Medical Devices (BfArM). This process is significantly more complex and requires a licensed regulatory consultant.',
    },
    {
        question: 'What is Form M and why do I need it?',
        answer: 'Form M is a mandatory document for all imports into Nigeria valued above USD 500. It must be obtained through your bank and registered with the Central Bank of Nigeria (CBN) for foreign exchange allocation. Without Form M, your goods cannot clear customs.',
    },
]

export default function RegulatoryGuidePage(): ReactElement {
    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Badge variant="secondary" className="mb-3">Compliance Resource</Badge>
                <h1 className="text-3xl font-bold text-foreground">
                    Regulatory Guide: Importing Pharmaceuticals from Germany to Nigeria
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Step-by-step guidance on NAFDAC registration, Nigerian Customs procedures, and required documentation.
                </p>
                <div className="mt-4 rounded-lg bg-accent/20 p-4 text-sm text-accent-foreground">
                    <AlertTriangleIcon className="mb-1 inline h-4 w-4" />
                    {' '}This guide is for informational purposes only. Please consult a licensed pharmaceutical regulatory
                    consultant or customs broker for advice specific to your situation.
                </div>
            </div>

            {/* Section 1: NAFDAC Registration */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    <ShieldCheckIcon className="mr-2 inline h-5 w-5 text-primary" />
                    1. NAFDAC Product Registration
                </h2>
                <Card className="p-6">
                    <p className="mb-4 text-sm text-muted-foreground">
                        All pharmaceutical products imported into Nigeria must be registered with the National Agency for Food and Drug
                        Administration and Control (NAFDAC). The registration process verifies the safety, efficacy, and quality of the product.
                    </p>
                    <h3 className="mb-2 font-medium text-foreground">Steps:</h3>
                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                        <li>Confirm your company holds a valid Premises License from PCN and NAFDAC.</li>
                        <li>Obtain product dossier from the German manufacturer (CTD format preferred).</li>
                        <li>Submit online application via the NAFDAC Automated Product Administration and Monitoring System (NAPAMS).</li>
                        <li>Pay the applicable registration fees.</li>
                        <li>Await product evaluation (laboratory analysis, document review).</li>
                        <li>Respond to any queries from NAFDAC reviewers.</li>
                        <li>Receive NAFDAC Registration Number upon approval.</li>
                    </ol>
                    <div className="mt-4">
                        <a
                            href="https://nafdac.gov.ng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Visit NAFDAC Official Website <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                    </div>
                </Card>
            </section>

            {/* Section 2: Nigerian Customs */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    <ShieldCheckIcon className="mr-2 inline h-5 w-5 text-primary" />
                    2. Nigerian Customs Import Procedures
                </h2>
                <Card className="p-6">
                    <p className="mb-4 text-sm text-muted-foreground">
                        All goods entering Nigeria must clear through the Nigerian Customs Service (NCS). Pharmaceutical imports
                        undergo additional scrutiny to prevent counterfeit medicines.
                    </p>
                    <h3 className="mb-2 font-medium text-foreground">Key Steps:</h3>
                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                        <li>Obtain Form M from your bank for foreign exchange allocation.</li>
                        <li>Arrange Pre-Arrival Assessment Report (PAAR) from NCS.</li>
                        <li>Submit Single Goods Declaration (SGD) electronically via NICIS II.</li>
                        <li>Present all shipping and product documentation at the port.</li>
                        <li>Undergo physical examination of goods if selected.</li>
                        <li>Pay applicable customs duties and Value Added Tax (VAT).</li>
                        <li>Obtain NAFDAC port clearance for pharmaceutical cargo.</li>
                        <li>Release goods upon final customs clearance.</li>
                    </ol>
                    <div className="mt-4">
                        <a
                            href="https://customs.gov.ng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Visit Nigerian Customs Service <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                    </div>
                </Card>
            </section>

            {/* Section 3: HS Codes & Tariffs */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    <ShieldCheckIcon className="mr-2 inline h-5 w-5 text-primary" />
                    3. Tariffs & HS Codes
                </h2>
                <Card className="p-6">
                    <p className="mb-4 text-sm text-muted-foreground">
                        Harmonized System (HS) codes classify pharmaceutical products for customs purposes. The correct code
                        determines applicable duty rates and regulatory requirements.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="pb-2 font-medium text-foreground">HS Chapter</th>
                                    <th className="pb-2 font-medium text-foreground">Description</th>
                                    <th className="pb-2 font-medium text-foreground">Typical Duty</th>
                                </tr>
                            </thead>
                            <tbody className="text-muted-foreground">
                                <tr className="border-b"><td className="py-2">29</td><td>Organic chemical compounds (APIs)</td><td>0–5%</td></tr>
                                <tr className="border-b"><td className="py-2">30</td><td>Pharmaceutical products</td><td>5–20%</td></tr>
                                <tr className="border-b"><td className="py-2">3001–3002</td><td>Biological products, vaccines, blood</td><td>5%</td></tr>
                                <tr className="border-b"><td className="py-2">3003–3004</td><td>Medicaments (mixed or unmixed)</td><td>10–20%</td></tr>
                                <tr className="border-b"><td className="py-2">3005–3006</td><td>Bandages, surgical sutures, diagnostic reagents</td><td>5–10%</td></tr>
                                <tr><td className="py-2">9018</td><td>Medical instruments and appliances</td><td>5%</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Note: Duty rates are approximate and based on the ECOWAS CET. Always verify with the latest
                        Nigerian Customs tariff schedule.
                    </p>
                </Card>
            </section>

            {/* Section 4: Required Documents */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    <FileTextIcon className="mr-2 inline h-5 w-5 text-primary" />
                    4. Required Documents Checklist
                </h2>
                <Card className="p-6">
                    <ul className="space-y-2">
                        {REQUIRED_DOCS.map((doc) => (
                            <li key={doc} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                {doc}
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">
                        Track your document progress in your{' '}
                        <Link href="/dashboard/checklist" className="text-primary hover:underline">
                            Regulatory Checklist
                        </Link>
                        {' '}on the dashboard.
                    </p>
                </Card>
            </section>

            {/* Section 5: German Export Regs */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    <ShieldCheckIcon className="mr-2 inline h-5 w-5 text-primary" />
                    5. German Pharmaceutical Export Regulations
                </h2>
                <Card className="p-6">
                    <p className="mb-4 text-sm text-muted-foreground">
                        German pharmaceutical exporters must comply with EU and German national regulations:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• <strong>EU GMP Compliance</strong> — Manufacturing must follow EU Good Manufacturing Practice guidelines.</li>
                        <li>• <strong>BfArM Oversight</strong> — The Federal Institute for Drugs and Medical Devices oversees pharmaceutical product safety.</li>
                        <li>• <strong>PEI Regulation</strong> — Paul-Ehrlich-Institut regulates vaccines and biologics.</li>
                        <li>• <strong>EU Falsified Medicines Directive (FMD)</strong> — Serialization and tamper-evident packaging required.</li>
                        <li>• <strong>BAFA Export Controls</strong> — Certain dual-use items require export permits from the Federal Office for Economic Affairs and Export Control.</li>
                        <li>• <strong>WHO Pre-qualification</strong> — Many manufacturers seek WHO-GMP pre-qualification for exports to developing countries.</li>
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a href="https://www.bfarm.de" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">BfArM <ExternalLinkIcon className="h-3 w-3" /></a>
                        <a href="https://www.pei.de" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">PEI <ExternalLinkIcon className="h-3 w-3" /></a>
                        <a href="https://www.ema.europa.eu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">EU EMA <ExternalLinkIcon className="h-3 w-3" /></a>
                    </div>
                </Card>
            </section>

            {/* Section 6: Common Risks */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                    <AlertTriangleIcon className="mr-2 inline h-5 w-5 text-accent" />
                    6. Common Risks & Pitfalls
                </h2>
                <Card className="p-6">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li>• <strong>Counterfeit products</strong> — Always verify supplier certifications and request batch-level CoA.</li>
                        <li>• <strong>Expired documents</strong> — Ensure all permits, GMP certificates, and registrations are current.</li>
                        <li>• <strong>Incorrect HS codes</strong> — Misclassification can lead to penalties, seizure, or higher duties.</li>
                        <li>• <strong>Cold chain breaks</strong> — Temperature-sensitive products (vaccines, biologics) require documented cold chain logistics.</li>
                        <li>• <strong>Incomplete Form M</strong> — Failure to complete Form M correctly delays customs clearance and forex allocation.</li>
                        <li>• <strong>NAFDAC port delays</strong> — Ensure NAFDAC clearance is pre-arranged to avoid demurrage charges.</li>
                    </ul>
                </Card>
            </section>

            {/* FAQ */}
            <section className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {FAQ_ITEMS.map((item) => (
                        <Collapsible key={item.question}>
                            <Card className="overflow-hidden">
                                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-foreground hover:bg-muted/50">
                                    {item.question}
                                    <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="border-t px-4 py-3">
                                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                                    </div>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <Card className="bg-primary/5 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Have a specific question about importing pharmaceuticals from Germany?
                </p>
                <Link
                    href="/agent-chat"
                    className="mt-2 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Ask PharmAgent AI
                </Link>
            </Card>
        </div>
    )
}
