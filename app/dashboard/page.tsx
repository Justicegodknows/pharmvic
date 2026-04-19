import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { redirect } from 'next/navigation'
import {
    InboxIcon,
    FileTextIcon,
    PackageIcon,
    ClipboardCheckIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'

export default async function DashboardPage(): Promise<ReactElement> {
    // Auth via Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // Profile + stats from Docker DB
    const [profile] = await sql`
        SELECT role, full_name, company_name FROM profiles WHERE id = ${user.id} LIMIT 1
    `

    const isVendor = profile?.role === 'vendor'
    const isSupplier = profile?.role === 'supplier'

    let inquiryCount = 0
    let documentCount = 0
    let productCount = 0

    if (isVendor) {
        const [vendor] = await sql`
            SELECT id FROM vendors WHERE user_id = ${user.id} LIMIT 1
        `
        if (vendor) {
            const [{ count: ic }] = await sql`SELECT COUNT(*)::int AS count FROM inquiries WHERE vendor_id = ${vendor.id}`
            const [{ count: dc }] = await sql`SELECT COUNT(*)::int AS count FROM documents WHERE vendor_id = ${vendor.id}`
            inquiryCount = ic ?? 0
            documentCount = dc ?? 0
        }
    }

    if (isSupplier) {
        const [supplier] = await sql`
            SELECT id FROM suppliers WHERE user_id = ${user.id} LIMIT 1
        `
        if (supplier) {
            const [{ count: ic }] = await sql`SELECT COUNT(*)::int AS count FROM inquiries WHERE supplier_id = ${supplier.id}`
            const [{ count: pc }] = await sql`SELECT COUNT(*)::int AS count FROM products WHERE supplier_id = ${supplier.id}`
            inquiryCount = ic ?? 0
            productCount = pc ?? 0
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-headline text-3xl font-extrabold text-ci-primary">
                    Welcome, {profile?.full_name || 'User'}
                </h1>
                <p className="mt-1 text-ci-on-surface-variant">
                    {profile?.company_name} &middot;{' '}
                    <span className="inline-block bg-ci-secondary-container/20 text-ci-on-secondary-container text-xs font-bold px-2 py-0.5 rounded capitalize">{profile?.role}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/inquiries">
                    <div className="bg-white p-6 rounded-xl border border-ci-outline-variant/15 transition-colors hover:bg-ci-surface-low">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-ci-secondary-container/30 text-ci-secondary p-2 rounded-lg">
                                <InboxIcon className="h-5 w-5" />
                            </span>
                        </div>
                        <p className="text-ci-on-surface-variant text-sm font-medium">Inquiries</p>
                        <h2 className="text-4xl font-headline font-bold text-ci-primary mt-1">{inquiryCount}</h2>
                    </div>
                </Link>

                {isVendor && (
                    <Link href="/dashboard/documents">
                        <div className="bg-white p-6 rounded-xl border border-ci-outline-variant/15 transition-colors hover:bg-ci-surface-low">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-ci-secondary-container/30 text-ci-secondary p-2 rounded-lg">
                                    <FileTextIcon className="h-5 w-5" />
                                </span>
                            </div>
                            <p className="text-ci-on-surface-variant text-sm font-medium">Documents</p>
                            <h2 className="text-4xl font-headline font-bold text-ci-primary mt-1">{documentCount}</h2>
                        </div>
                    </Link>
                )}

                {isSupplier && (
                    <Link href="/dashboard/products">
                        <div className="bg-white p-6 rounded-xl border border-ci-outline-variant/15 transition-colors hover:bg-ci-surface-low">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-ci-secondary-container/30 text-ci-secondary p-2 rounded-lg">
                                    <PackageIcon className="h-5 w-5" />
                                </span>
                            </div>
                            <p className="text-ci-on-surface-variant text-sm font-medium">Products</p>
                            <h2 className="text-4xl font-headline font-bold text-ci-primary mt-1">{productCount}</h2>
                        </div>
                    </Link>
                )}

                {isVendor && (
                    <Link href="/dashboard/checklist">
                        <div className="bg-white p-6 rounded-xl border border-ci-outline-variant/15 transition-colors hover:bg-ci-surface-low">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-ci-error-container/30 text-ci-error p-2 rounded-lg">
                                    <ClipboardCheckIcon className="h-5 w-5" />
                                </span>
                            </div>
                            <p className="text-ci-on-surface-variant text-sm font-medium">Reg. Checklist</p>
                            <h2 className="text-4xl font-headline font-bold text-ci-primary mt-1">&mdash;</h2>
                        </div>
                    </Link>
                )}
            </div>

            {/* Quick actions */}
            <div className="mt-8">
                <h2 className="mb-4 font-headline text-lg font-bold text-ci-primary">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    {isVendor && (
                        <>
                            <Link
                                href="/marketplace"
                                className="rounded-full border border-ci-outline-variant/30 px-6 py-2 text-sm font-bold text-ci-on-surface-variant transition-colors hover:bg-ci-surface-low"
                            >
                                Browse Suppliers
                            </Link>
                            <Link
                                href="/regulatory-guide"
                                className="rounded-full border border-ci-outline-variant/30 px-6 py-2 text-sm font-bold text-ci-on-surface-variant transition-colors hover:bg-ci-surface-low"
                            >
                                Regulatory Guide
                            </Link>
                            <Link
                                href="/agent-chat"
                                className="rounded-full bg-ci-primary px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-all"
                            >
                                Ask PharmAgent
                            </Link>
                        </>
                    )}
                    {isSupplier && (
                        <>
                            <Link
                                href="/dashboard/products"
                                className="rounded-full border border-ci-outline-variant/30 px-6 py-2 text-sm font-bold text-ci-on-surface-variant transition-colors hover:bg-ci-surface-low"
                            >
                                Manage Products
                            </Link>
                            <Link
                                href="/dashboard/profile"
                                className="rounded-full border border-ci-outline-variant/30 px-6 py-2 text-sm font-bold text-ci-on-surface-variant transition-colors hover:bg-ci-surface-low"
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
