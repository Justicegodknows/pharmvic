import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShieldCheckIcon } from 'lucide-react'
import type { ReactElement } from 'react'

export type SupplierCardData = {
    id: string
    company_name: string
    description: string | null
    certifications: string[]
    verified: boolean
    logo_url: string | null
    products: { category: string }[]
}

type SupplierCardProps = {
    supplier: SupplierCardData
}

export function SupplierCard({ supplier }: SupplierCardProps): ReactElement {
    const categories = [...new Set(supplier.products.map((p) => p.category))]

    return (
        <Card className="flex flex-col p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        {supplier.company_name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{supplier.company_name}</h3>
                            {supplier.verified && (
                                <ShieldCheckIcon className="h-4 w-4 text-primary" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Germany</p>
                    </div>
                </div>
            </div>

            {supplier.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {supplier.description}
                </p>
            )}

            {categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                        </Badge>
                    ))}
                    {categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                            +{categories.length - 3} more
                        </Badge>
                    )}
                </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
                {supplier.certifications.slice(0, 4).map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                        {cert}
                    </Badge>
                ))}
            </div>

            <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/marketplace/${supplier.id}`}>View Profile</Link>
                </Button>
            </div>
        </Card>
    )
}
