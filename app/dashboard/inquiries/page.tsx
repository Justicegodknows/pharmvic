import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { ReactElement } from 'react'

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline'> = {
    pending: 'secondary',
    responded: 'default',
    closed: 'outline',
}

export default async function InquiriesPage(): Promise<ReactElement> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isVendor = profile?.role === 'vendor'

    let inquiries: {
        id: string
        subject: string
        message: string
        status: string
        response: string | null
        created_at: string
        suppliers?: { company_name: string } | null
        vendors?: { company_name: string } | null
    }[] = []

    if (isVendor) {
        const { data: vendor } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (vendor) {
            const { data } = await supabase
                .from('inquiries')
                .select('*, suppliers:supplier_id(company_name)')
                .eq('vendor_id', vendor.id)
                .order('created_at', { ascending: false })
            inquiries = data ?? []
        }
    } else {
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (supplier) {
            const { data } = await supabase
                .from('inquiries')
                .select('*, vendors:vendor_id(company_name)')
                .eq('supplier_id', supplier.id)
                .order('created_at', { ascending: false })
            inquiries = data ?? []
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-foreground">
                {isVendor ? 'My Inquiries' : 'Incoming Inquiries'}
            </h1>

            {inquiries.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No inquiries yet.</p>
                    {isVendor && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Browse the <a href="/marketplace" className="text-primary hover:underline">marketplace</a> to find suppliers.
                        </p>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {inquiries.map((inq) => (
                        <Card key={inq.id} className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">{inq.subject}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {isVendor
                                            ? `To: ${(inq.suppliers as { company_name: string } | null)?.company_name ?? 'Unknown'}`
                                            : `From: ${(inq.vendors as { company_name: string } | null)?.company_name ?? 'Unknown'}`}
                                        {' · '}
                                        {new Date(inq.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant={STATUS_COLORS[inq.status] ?? 'outline'} className="capitalize">
                                    {inq.status}
                                </Badge>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{inq.message}</p>
                            {inq.response && (
                                <div className="mt-3 rounded-lg bg-muted p-3">
                                    <p className="text-xs font-medium text-foreground">Response:</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{inq.response}</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
