import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    InboxIcon,
    FileTextIcon,
    PackageIcon,
    ClipboardCheckIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'

export default async function DashboardPage(): Promise<ReactElement> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, company_name')
        .eq('id', user.id)
        .single()

    const isVendor = profile?.role === 'vendor'
    const isSupplier = profile?.role === 'supplier'

    // Fetch stats
    let inquiryCount = 0
    let documentCount = 0
    let productCount = 0

    if (isVendor) {
        const { data: vendor } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (vendor) {
            const { count: ic } = await supabase
                .from('inquiries')
                .select('*', { count: 'exact', head: true })
                .eq('vendor_id', vendor.id)
            inquiryCount = ic ?? 0

            const { count: dc } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('vendor_id', vendor.id)
            documentCount = dc ?? 0
        }
    }

    if (isSupplier) {
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (supplier) {
            const { count: ic } = await supabase
                .from('inquiries')
                .select('*', { count: 'exact', head: true })
                .eq('supplier_id', supplier.id)
            inquiryCount = ic ?? 0

            const { count: pc } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('supplier_id', supplier.id)
            productCount = pc ?? 0
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">
                    Welcome, {profile?.full_name || 'User'}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {profile?.company_name} &middot;{' '}
                    <Badge variant="outline" className="capitalize">{profile?.role}</Badge>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/inquiries">
                    <Card className="p-6 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <InboxIcon className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-2xl font-bold text-foreground">{inquiryCount}</p>
                                <p className="text-sm text-muted-foreground">Inquiries</p>
                            </div>
                        </div>
                    </Card>
                </Link>

                {isVendor && (
                    <Link href="/dashboard/documents">
                        <Card className="p-6 transition-colors hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                                <FileTextIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{documentCount}</p>
                                    <p className="text-sm text-muted-foreground">Documents</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                )}

                {isSupplier && (
                    <Link href="/dashboard/products">
                        <Card className="p-6 transition-colors hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                                <PackageIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{productCount}</p>
                                    <p className="text-sm text-muted-foreground">Products</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                )}

                {isVendor && (
                    <Link href="/dashboard/checklist">
                        <Card className="p-6 transition-colors hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                                <ClipboardCheckIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">—</p>
                                    <p className="text-sm text-muted-foreground">Reg. Checklist</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                )}
            </div>

            {/* Quick actions */}
            <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    {isVendor && (
                        <>
                            <Link
                                href="/marketplace"
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Browse Suppliers
                            </Link>
                            <Link
                                href="/regulatory-guide"
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Regulatory Guide
                            </Link>
                            <Link
                                href="/agent-chat"
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Ask PharmAgent
                            </Link>
                        </>
                    )}
                    {isSupplier && (
                        <>
                            <Link
                                href="/dashboard/products"
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Manage Products
                            </Link>
                            <Link
                                href="/dashboard/profile"
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Edit Profile
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
