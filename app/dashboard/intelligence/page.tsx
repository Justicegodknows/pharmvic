import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
    TruckIcon,
    WalletIcon,
    BrainCircuitIcon,
    AlertTriangleIcon,
    ShieldCheckIcon,
    ShipIcon,
    BuildingIcon,
    HeartPulseIcon,
    FlaskConicalIcon,
    TrendingUpIcon,
    ArrowRightIcon,
} from 'lucide-react'
import type { ReactElement } from 'react'

/* ------------------------------------------------------------------ */
/*  Static data — replace with API calls when backend is connected    */
/* ------------------------------------------------------------------ */

const COMPLIANCE_ALERTS = [
    {
        severity: 'error' as const,
        title: 'NAFDAC Certificate Expiring',
        body: 'Batch #902 (Amoxicillin) requires re-certification for Nigerian retail sale by Friday.',
    },
    {
        severity: 'success' as const,
        title: 'Supply Chain Audit Complete',
        body: 'Partner "PharmaRoute Abuja" has cleared the annual German-Nigeria corridor safety audit.',
    },
    {
        severity: 'neutral' as const,
        title: 'Logistics: Port Delay',
        body: 'Apapa Port experiencing 48h congestion. Re-routing recommended via Onne.',
    },
]

const PARTNERSHIPS = [
    {
        name: 'Lagos Med-Supply Ltd',
        type: 'Distributor',
        region: 'Southern Region',
        value: '$420k',
        status: 'On-Track',
        statusColor: 'text-ci-secondary',
        icon: BuildingIcon,
    },
    {
        name: 'Kano Clinical Services',
        type: 'Health System',
        region: 'Northern Region',
        value: '$215k',
        status: 'Payment Alert',
        statusColor: 'text-ci-error',
        icon: HeartPulseIcon,
    },
    {
        name: 'Rivers Biotech Partners',
        type: 'Specialized Research',
        region: 'Port Harcourt',
        value: '$890k',
        status: 'Active Contract',
        statusColor: 'text-ci-secondary',
        icon: FlaskConicalIcon,
    },
]

const ALERT_STYLES = {
    error: { border: 'border-l-4 border-l-ci-error', icon: AlertTriangleIcon, iconColor: 'text-ci-error' },
    success: { border: 'border-l-4 border-l-ci-secondary', icon: ShieldCheckIcon, iconColor: 'text-ci-secondary' },
    neutral: { border: 'border-l-4 border-l-ci-primary', icon: ShipIcon, iconColor: 'text-ci-primary' },
} as const

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function IntelligencePage(): ReactElement {
    return (
        <div className="space-y-12">
            {/* ── Hero Strategy Section ── */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="flex flex-col justify-center lg:col-span-8">
                    <h1 className="font-heading text-5xl font-extrabold tracking-tight text-ci-primary md:text-6xl">
                        Market Intelligence{' '}
                        <br />
                        <span className="text-ci-secondary">Nigeria Hub</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-ci-on-surface-variant">
                        Aggregated real-time insights across the Nigerian-German corridor.
                        Monitoring pharmaceutical demand trends and supply chain integrity.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/dashboard/intelligence"
                            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-ci-primary to-ci-primary-container px-8 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                        >
                            Execute Trade Strategy
                            <TrendingUpIcon className="h-4 w-4" />
                        </Link>
                        <button
                            type="button"
                            className="rounded-full border border-ci-outline-variant px-8 py-3 font-bold text-ci-on-surface-variant transition-colors hover:bg-ci-surface-low"
                        >
                            Download Report
                        </button>
                    </div>
                </div>

                {/* Regional alert card */}
                <div className="relative min-h-75 overflow-hidden rounded-xl bg-linear-to-br from-ci-primary to-ci-primary-container lg:col-span-4">
                    <div className="relative flex h-full flex-col justify-between p-8">
                        <div className="rounded-lg bg-ci-secondary-container/20 p-4 backdrop-blur-md">
                            <p className="text-xs font-bold uppercase tracking-widest text-ci-secondary-container">
                                Regional Alert
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-white">Lagos Logistics Center</h3>
                            <p className="mt-2 text-sm text-ci-outline-variant">
                                Predicted demand surge: +24% for Anti-Malarials in Q3.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                            <ShieldCheckIcon className="h-5 w-5 text-ci-secondary-container" />
                            <span className="text-sm font-medium text-white">
                                Compliance: 100% Verified Path
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Metrics Grid (Asymmetric Bento) ── */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {/* Active Shipments */}
                <Card className="flex flex-col justify-between rounded-xl border-ci-outline-variant/15 bg-ci-surface-white p-6">
                    <div>
                        <div className="mb-4 flex items-start justify-between">
                            <span className="rounded-lg bg-ci-secondary-container/30 p-2">
                                <TruckIcon className="h-5 w-5 text-ci-secondary" />
                            </span>
                            <span className="text-xs font-bold text-ci-secondary">+12% vs LW</span>
                        </div>
                        <p className="text-sm font-medium text-ci-on-surface-variant">Active Shipments</p>
                        <h2 className="mt-1 text-4xl font-bold tracking-tight text-ci-primary">142</h2>
                    </div>
                    <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-ci-surface-high">
                        <div className="h-full w-3/4 bg-ci-secondary" />
                    </div>
                </Card>

                {/* Pending Credits */}
                <Card className="flex flex-col justify-between rounded-xl border-ci-outline-variant/15 bg-ci-surface-white p-6">
                    <div>
                        <div className="mb-4 flex items-start justify-between">
                            <span className="rounded-lg bg-ci-error-container/30 p-2">
                                <WalletIcon className="h-5 w-5 text-ci-error" />
                            </span>
                        </div>
                        <p className="text-sm font-medium text-ci-on-surface-variant">Pending Credits</p>
                        <h2 className="mt-1 text-4xl font-bold tracking-tight text-ci-primary">$1.2M</h2>
                    </div>
                    <p className="mt-6 text-xs text-ci-on-surface-variant">
                        4 Invoices overdue &gt; 30 days
                    </p>
                </Card>

                {/* AI Market Pulse — spanning 2 columns */}
                <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-ci-primary to-ci-primary-container p-6 text-white md:col-span-2">
                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-2">
                            <BrainCircuitIcon className="h-5 w-5 text-ci-secondary-container" />
                            <span className="text-xs font-bold uppercase tracking-widest text-ci-secondary-container">
                                AI Market Pulse
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold">High Demand: Kano State</h3>
                        <p className="mt-2 max-w-md text-sm text-ci-outline-variant">
                            Our neural network predicts a shortage of essential biologics in
                            northern hubs within 14 days. Recommend re-routing shipment #A293.
                        </p>
                        <button
                            type="button"
                            className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-ci-secondary-container hover:underline"
                        >
                            View Deep Analysis <ArrowRightIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Alerts & Partnerships (Bento Grid) ── */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Compliance Alerts */}
                <div className="space-y-4 lg:col-span-5">
                    <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xl font-bold text-ci-primary">Compliance Alerts</h4>
                        <Badge className="bg-ci-secondary-container/20 text-ci-secondary">
                            2 Critical
                        </Badge>
                    </div>

                    {COMPLIANCE_ALERTS.map((alert) => {
                        const style = ALERT_STYLES[alert.severity]
                        const Icon = style.icon
                        return (
                            <div
                                key={alert.title}
                                className={`flex gap-4 rounded-xl bg-ci-surface-low p-4 ${style.border}`}
                            >
                                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
                                <div>
                                    <p className="text-sm font-bold text-ci-primary">{alert.title}</p>
                                    <p className="mt-1 text-xs text-ci-on-surface-variant">
                                        {alert.body}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Partnership Overview */}
                <Card className="rounded-xl border-ci-outline-variant/15 bg-ci-surface-white p-8 lg:col-span-7">
                    <div className="mb-8 flex items-center justify-between">
                        <h4 className="text-xl font-bold text-ci-primary">Active Partnerships</h4>
                        <button
                            type="button"
                            className="text-sm font-bold text-ci-secondary transition-opacity hover:opacity-70"
                        >
                            Manage All
                        </button>
                    </div>

                    <div className="space-y-6">
                        {PARTNERSHIPS.map((partner, idx) => {
                            const Icon = partner.icon
                            const isLast = idx === PARTNERSHIPS.length - 1
                            return (
                                <div
                                    key={partner.name}
                                    className={`flex items-center justify-between ${isLast ? '' : 'border-b border-ci-outline-variant/10 pb-6'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ci-surface-high">
                                            <Icon className="h-5 w-5 text-ci-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-ci-primary">{partner.name}</p>
                                            <p className="text-xs text-ci-on-surface-variant">
                                                {partner.type} &bull; {partner.region}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-ci-primary">{partner.value}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-tighter ${partner.statusColor}`}>
                                            {partner.status}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </section>
        </div>
    )
}
