import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  SearchIcon,
  UserPlusIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  GlobeIcon,
  PackageIcon,
  BuildingIcon,
} from 'lucide-react'
import type { ReactElement } from 'react'

const STATS = [
  { label: 'Verified Suppliers', value: '50+', icon: BuildingIcon },
  { label: 'Registered Vendors', value: '200+', icon: UserPlusIcon },
  { label: 'Product Categories', value: '30+', icon: PackageIcon },
  { label: 'Countries', value: '2', icon: GlobeIcon },
]

const STEPS = [
  {
    step: '01',
    title: 'Register',
    description: 'Create your free account as a Nigerian vendor or German supplier. Complete your profile with company details.',
  },
  {
    step: '02',
    title: 'Search & Discover',
    description: 'Browse GMP-certified German manufacturers. Filter by product category, certifications, and export capabilities.',
  },
  {
    step: '03',
    title: 'Connect & Trade',
    description: 'Send inquiries, request quotes, and initiate verified trade relationships. PharmAgent guides you through compliance.',
  },
]

const FEATURED_SUPPLIERS = [
  {
    name: 'BerlinPharma GmbH',
    products: 'Antibiotics, Cardiovascular',
    certifications: ['GMP', 'WHO-GMP', 'ISO 9001'],
  },
  {
    name: 'MunichMed AG',
    products: 'Analgesics, Anti-inflammatories',
    certifications: ['GMP', 'CE Mark', 'ISO 9001'],
  },
  {
    name: 'HamburgBio GmbH',
    products: 'Biologics, Vaccines',
    certifications: ['WHO-GMP', 'EU GMP', 'PEI Approved'],
  },
]

export default function HomePage(): ReactElement {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/10 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Nigeria 🇳🇬 ↔ Germany 🇩🇪
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Connecting Nigerian Pharma Vendors with{' '}
              <span className="text-primary">German Manufacturers</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Discover verified German pharmaceutical suppliers, understand NAFDAC requirements,
              and initiate trusted B2B trade relationships — all in one platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/marketplace">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Find a Supplier
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/register">
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Register as Vendor
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/agent-chat">
                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                  Talk to PharmAgent
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Suppliers */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Featured German Manufacturers</h2>
            <p className="mt-2 text-muted-foreground">Verified pharmaceutical suppliers ready to export</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SUPPLIERS.map((supplier) => (
              <Card key={supplier.name} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{supplier.products}</p>
                  </div>
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {supplier.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href="/marketplace">View Profile</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to start importing from Germany</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="relative rounded-xl bg-background p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">What Our Users Say</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: 'PharmConnect simplified our entire import process. We found three new reliable German suppliers in our first week.',
                name: 'Adebayo O.',
                title: 'Procurement Manager, Lagos',
              },
              {
                quote: 'The regulatory guide and PharmAgent saved us months of research on NAFDAC requirements.',
                name: 'Chioma N.',
                title: 'Director, PharmaBridge Nigeria',
              },
              {
                quote: 'As a German exporter, PharmConnect opened the Nigerian market for us with verified, serious buyers.',
                name: 'Klaus M.',
                title: 'Export Director, Berlin',
              },
            ].map((t) => (
              <Card key={t.name} className="p-6">
                <p className="text-sm italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground">Ready to Start Trading?</h2>
          <p className="mt-4 text-primary-foreground/80">
            Join PharmConnect today and access verified German pharmaceutical manufacturers.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/marketplace">Browse Suppliers</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
