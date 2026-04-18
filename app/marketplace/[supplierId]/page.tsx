import sql from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    ShieldCheckIcon,
    GlobeIcon,
    CalendarIcon,
    MapPinIcon,
    PackageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InquiryForm } from './inquiry-form'
import type { ReactElement } from 'react'

type Product = {
    id: string
    name: string
    description: string | null
    hs_code: string | null
    category: string
    min_order_qty: number | null
    unit: string | null
    certifications: string[]
}

type SupplierProfilePageProps = {
    params: Promise<{ supplierId: string }>
}

export default async function SupplierProfilePage({
    params,
}: SupplierProfilePageProps): Promise<ReactElement> {
    const { supplierId } = await params

    const [supplier] = await sql`
        SELECT s.*, json_agg(p.*) FILTER (WHERE p.id IS NOT NULL) AS products
        FROM suppliers s
        LEFT JOIN products p ON p.supplier_id = s.id
        WHERE s.id = ${supplierId}
        GROUP BY s.id
        LIMIT 1
    `

    if (!supplier) {
        notFound()
    }

    // Normalise: products may be null when no products exist
    const products = ((supplier.products as unknown[] | null) ?? []) as Product[]

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-4">
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">
                    ← Back to Marketplace
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2">
                    {/* Company header */}
                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                                {supplier.company_name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-foreground">{supplier.company_name}</h1>
                                    {supplier.verified && (
                                        <Badge className="bg-primary text-primary-foreground">
                                            <ShieldCheckIcon className="mr-1 h-3 w-3" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPinIcon className="h-3.5 w-3.5" />
                                        {supplier.address ?? 'Germany'}
                                    </span>
                                    {supplier.founded_year && (
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            Founded {supplier.founded_year}
                                        </span>
                                    )}
                                    {supplier.website && (
                                        <a
                                            href={supplier.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline"
                                        >
                                            <GlobeIcon className="h-3.5 w-3.5" />
                                            Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {supplier.description && (
                            <>
                                <Separator className="my-4" />
                                <p className="text-sm text-muted-foreground">{supplier.description}</p>
                            </>
                        )}
                    </Card>

                    {/* Certifications */}
                    {supplier.certifications.length > 0 && (
                        <Card className="mt-6 p-6">
                            <h2 className="mb-4 text-lg font-semibold">Certifications</h2>
                            <div className="flex flex-wrap gap-2">
                                {supplier.certifications.map((cert: string) => (
                                    <Badge key={cert} variant="outline" className="px-3 py-1">
                                        <ShieldCheckIcon className="mr-1.5 h-3 w-3 text-primary" />
                                        {cert}
                                    </Badge>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Export Markets */}
                    {supplier.export_markets && supplier.export_markets.length > 0 && (
                        <Card className="mt-6 p-6">
                            <h2 className="mb-4 text-lg font-semibold">Export Markets</h2>
                            <div className="flex flex-wrap gap-2">
                                {supplier.export_markets.map((market: string) => (
                                    <Badge key={market} variant="secondary">{market}</Badge>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Product Catalogue */}
                    <Card className="mt-6 p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            <PackageIcon className="mr-2 inline h-5 w-5" />
                            Product Catalogue
                        </h2>
                        {products.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No products listed yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <div key={product.id} className="rounded-lg border border-border p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-foreground">{product.name}</h3>
                                                <p className="text-xs text-muted-foreground">{product.category}</p>
                                            </div>
                                            {product.hs_code && (
                                                <Badge variant="outline" className="text-xs">
                                                    HS: {product.hs_code}
                                                </Badge>
                                            )}
                                        </div>
                                        {product.description && (
                                            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            {product.min_order_qty && (
                                                <span>MOQ: {product.min_order_qty} {product.unit ?? 'units'}</span>
                                            )}
                                            {product.certifications.length > 0 && (
                                                <div className="flex gap-1">
                                                    {product.certifications.map((c: string) => (
                                                        <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar — Inquiry form */}
                <div>
                    <Card className="sticky top-24 p-6">
                        <h2 className="mb-4 text-lg font-semibold">Send an Inquiry</h2>
                        <InquiryForm supplierId={supplierId} supplierName={supplier.company_name} />
                    </Card>
                </div>
            </div>
        </div>
    )
}
