import Link from 'next/link'
import {
  TruckIcon,
  WalletIcon,
  BrainCircuitIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  BuildingIcon,
  FlaskConicalIcon,
  HeartPulseIcon,
  TrendingUpIcon,
} from 'lucide-react'
import type { ReactElement } from 'react'

const METRICS = [
  {
    label: 'Active Shipments',
    value: '142',
    change: '+12% vs LW',
    icon: TruckIcon,
    iconBg: 'bg-[#79F6F5]/30',
    iconColor: 'text-[#006A6A]',
  },
  {
    label: 'Pending Credits',
    value: '$1.2M',
    note: '4 Invoices overdue > 30 days',
    icon: WalletIcon,
    iconBg: 'bg-[#FFDAD6]/30',
    iconColor: 'text-[#BA1A1A]',
  },
]

const ALERTS = [
  {
    title: 'NAFDAC Certificate Expiring',
    description: 'Batch #902 (Amoxicillin) requires re-certification for Nigerian retail sale by Friday.',
    borderColor: 'border-l-[#BA1A1A]',
    icon: ShieldAlertIcon,
    iconColor: 'text-[#BA1A1A]',
  },
  {
    title: 'Supply Chain Audit Complete',
    description: 'Partner "PharmaRoute Abuja" has cleared the annual German-Nigeria corridor safety audit.',
    borderColor: 'border-l-[#006A6A]',
    icon: ShieldCheckIcon,
    iconColor: 'text-[#006A6A]',
  },
  {
    title: 'Logistics: Port Delay',
    description: 'Apapa Port experiencing 48h congestion. Re-routing recommended via Onne.',
    borderColor: 'border-l-[#000F22]',
    icon: TruckIcon,
    iconColor: 'text-[#000F22]',
  },
]

const PARTNERS = [
  {
    name: 'Lagos Med-Supply Ltd',
    type: 'Distributor • Southern Region',
    value: '$420k',
    status: 'On-Track',
    statusColor: 'text-[#006A6A]',
    icon: BuildingIcon,
  },
  {
    name: 'Kano Clinical Services',
    type: 'Health System • Northern Region',
    value: '$215k',
    status: 'Payment Alert',
    statusColor: 'text-[#BA1A1A]',
    icon: HeartPulseIcon,
  },
  {
    name: 'Rivers Biotech Partners',
    type: 'Specialized Research • Port Harcourt',
    value: '$890k',
    status: 'Active Contract',
    statusColor: 'text-[#006A6A]',
    icon: FlaskConicalIcon,
  },
]

export default function HomePage(): ReactElement {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 pt-8 pb-24">
      {/* Hero Strategy Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-[#000F22] tracking-tight mb-4">
            Market Intelligence <br /><span className="text-[#006A6A]">Nigeria Hub</span>
          </h1>
          <p className="text-[#43474D] text-lg max-w-xl mb-8">
            Aggregated real-time insights across the Nigerian-German corridor.
            Monitoring pharmaceutical demand trends and supply chain integrity.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/marketplace"
              className="bg-[#000F22] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
            >
              Execute Trade Strategy <TrendingUpIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/regulatory-guide"
              className="border border-[#C4C6CE]/30 px-8 py-3 rounded-full font-bold text-[#43474D] hover:bg-[#F2F4F6] transition-colors"
            >
              Download Report
            </Link>
          </div>
        </div>

        {/* Regional Alert Card */}
        <div className="lg:col-span-4 gradient-primary rounded-xl overflow-hidden relative min-h-[300px]">
          <div className="absolute inset-0 bg-linear-to-br from-[#000F22] to-[#0A2540]" />
          <div className="relative p-8 h-full flex flex-col justify-between">
            <div className="bg-[#79F6F5]/20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-[#79F6F5] text-xs font-bold uppercase tracking-widest mb-1">Regional Alert</p>
              <h3 className="text-white font-headline text-xl font-bold">Lagos Logistics Center</h3>
              <p className="text-[#C4C6CE] text-sm mt-2">Predicted demand surge: +24% for Anti-Malarials in Q3.</p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-[#79F6F5]" />
              <span className="text-white text-sm font-medium">Compliance: 100% Verified Path</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {METRICS.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-xl border border-[#C4C6CE]/15 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`${metric.iconBg} ${metric.iconColor} p-2 rounded-lg`}>
                  <metric.icon className="h-5 w-5" />
                </span>
                {metric.change && (
                  <span className="text-[#006A6A] text-xs font-bold">{metric.change}</span>
                )}
              </div>
              <p className="text-[#43474D] text-sm font-medium">{metric.label}</p>
              <h2 className="text-4xl font-headline font-bold text-[#000F22] mt-1">{metric.value}</h2>
            </div>
            {metric.note ? (
              <p className="text-xs text-[#43474D] mt-6">{metric.note}</p>
            ) : (
              <div className="mt-6 h-1 w-full bg-[#ECEEF0] rounded-full overflow-hidden">
                <div className="bg-[#006A6A] h-full w-3/4" />
              </div>
            )}
          </div>
        ))}

        {/* AI Market Pulse — spanning 2 columns */}
        <div className="md:col-span-2 bg-linear-to-br from-[#000F22] to-[#0A2540] p-6 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuitIcon className="h-5 w-5 text-[#79F6F5]" />
              <span className="text-[#79F6F5] text-xs font-bold uppercase tracking-widest">AI Market Pulse</span>
            </div>
            <h3 className="text-2xl font-headline font-bold mb-2">High Demand: Kano State</h3>
            <p className="text-[#C4C6CE] text-sm max-w-md">
              Our neural network predicts a shortage of essential biologics in northern hubs within 14 days.
              Recommend re-routing shipment #A293.
            </p>
            <Link href="/agent-chat" className="mt-6 inline-block text-sm font-bold text-[#79F6F5] hover:underline">
              View Deep Analysis →
            </Link>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <BrainCircuitIcon className="h-48 w-48" />
          </div>
        </div>
      </section>

      {/* Alerts and Partners (Bento Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Alerts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-headline text-xl font-bold text-[#000F22]">Compliance Alerts</h4>
            <span className="text-xs font-bold text-[#006A6A] bg-[#79F6F5]/20 px-2 py-1 rounded">
              2 Critical
            </span>
          </div>
          {ALERTS.map((alert) => (
            <div
              key={alert.title}
              className={`bg-[#F2F4F6] p-4 rounded-xl flex gap-4 items-start border-l-4 ${alert.borderColor}`}
            >
              <alert.icon className={`h-5 w-5 mt-1 ${alert.iconColor}`} />
              <div>
                <p className="text-[#000F22] font-bold text-sm">{alert.title}</p>
                <p className="text-[#43474D] text-xs mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Partnerships */}
        <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-[#C4C6CE]/15">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline text-xl font-bold text-[#000F22]">Active Partnerships</h4>
            <Link href="/marketplace" className="text-[#006A6A] font-bold text-sm hover:opacity-70 transition-opacity">
              Manage All
            </Link>
          </div>
          <div className="space-y-6">
            {PARTNERS.map((partner, i) => (
              <div
                key={partner.name}
                className={`flex items-center justify-between ${i < PARTNERS.length - 1 ? 'pb-6 border-b border-[#C4C6CE]/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#E6E8EA] rounded-full flex items-center justify-center">
                    <partner.icon className="h-5 w-5 text-[#000F22]" />
                  </div>
                  <div>
                    <p className="text-[#000F22] font-bold">{partner.name}</p>
                    <p className="text-[#43474D] text-xs">{partner.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#000F22] font-bold">{partner.value}</p>
                  <p className={`${partner.statusColor} text-[10px] font-bold uppercase tracking-tight`}>
                    {partner.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
