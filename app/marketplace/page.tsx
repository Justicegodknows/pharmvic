import sql from '@/lib/db/client'
import { SupplierCard } from '@/app/components/supplier-card'
import { SearchFilter } from './search-filter'
import type { ReactElement } from 'react'

type MarketplacePageProps = {
    searchParams: Promise<{ q?: string; category?: string; cert?: string }>
}

export default async function MarketplacePage({
    searchParams,
}: MarketplacePageProps): Promise<ReactElement> {
    const params = await searchParams

    // Build a single query with optional filters
    const q = params.q ?? null
    const cert = params.cert ?? null
    const category = params.category ?? null

    const suppliers = await sql`
        SELECT DISTINCT ON (s.id)
            s.id, s.company_name, s.description, s.certifications, s.verified, s.logo_url,
            COALESCE(
                json_agg(json_build_object('category', p.category)) FILTER (WHERE p.id IS NOT NULL),
                '[]'
            ) AS products
        FROM suppliers s
        LEFT JOIN products p ON p.supplier_id = s.id
        WHERE
            (${q}::text IS NULL
                OR s.company_name ILIKE ${'%' + (params.q ?? '') + '%'}
                OR s.description  ILIKE ${'%' + (params.q ?? '') + '%'})
            AND (${cert}::text IS NULL
                OR s.certifications @> ARRAY[${cert}])
            AND (${category}::text IS NULL
                OR EXISTS (
                    SELECT 1 FROM products p2
                    WHERE p2.supplier_id = s.id
                      AND p2.category ILIKE ${'%' + (params.category ?? '') + '%'}
                ))
        GROUP BY s.id
        ORDER BY s.id, s.verified DESC, s.company_name
    `

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
                <p className="mt-1 text-muted-foreground">
                    Browse verified German pharmaceutical manufacturers and exporters
                </p>
            </div>

            <div className="mb-8">
                <SearchFilter />
            </div>

            {suppliers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                    <p className="text-muted-foreground">No suppliers found matching your criteria.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {suppliers.map((supplier) => (
                        <SupplierCard key={supplier.id as string} supplier={supplier as Parameters<typeof SupplierCard>[0]['supplier']} />
                    ))}
                </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
                Showing {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}
            </div>
        </div>
    )
}
