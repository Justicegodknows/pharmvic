import { createClient } from '@/lib/supabase/server'
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
    const supabase = await createClient()

    let query = supabase
        .from('suppliers')
        .select('id, company_name, description, certifications, verified, logo_url, products:products(category)')
        .order('verified', { ascending: false })
        .order('company_name')

    if (params.q) {
        query = query.or(`company_name.ilike.%${params.q}%,description.ilike.%${params.q}%`)
    }

    if (params.cert) {
        query = query.contains('certifications', [params.cert])
    }

    const { data: suppliers } = await query

    // Client-side category filter (products is a nested relation)
    let filtered = suppliers ?? []
    if (params.category) {
        filtered = filtered.filter((s) =>
            s.products.some((p: { category: string }) => p.category === params.category)
        )
    }

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

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                    <p className="text-muted-foreground">No suppliers found matching your criteria.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((supplier) => (
                        <SupplierCard key={supplier.id} supplier={supplier} />
                    ))}
                </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
                Showing {filtered.length} supplier{filtered.length !== 1 ? 's' : ''}
            </div>
        </div>
    )
}
