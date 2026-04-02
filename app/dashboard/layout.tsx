import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    LayoutDashboardIcon,
    InboxIcon,
    FileTextIcon,
    ClipboardCheckIcon,
    MessageSquareIcon,
    PackageIcon,
    UsersIcon,
    BrainCircuitIcon,
} from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'

const VENDOR_NAV = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboardIcon },
    { href: '/dashboard/intelligence', label: 'Market Intel', icon: BrainCircuitIcon },
    { href: '/dashboard/inquiries', label: 'My Inquiries', icon: InboxIcon },
    { href: '/dashboard/documents', label: 'Documents', icon: FileTextIcon },
    { href: '/dashboard/checklist', label: 'Checklist', icon: ClipboardCheckIcon },
    { href: '/dashboard/chat', label: 'PharmAgent', icon: MessageSquareIcon },
]

const SUPPLIER_NAV = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboardIcon },
    { href: '/dashboard/intelligence', label: 'Market Intel', icon: BrainCircuitIcon },
    { href: '/dashboard/inquiries', label: 'Inquiries', icon: InboxIcon },
    { href: '/dashboard/products', label: 'Products', icon: PackageIcon },
    { href: '/dashboard/profile', label: 'Company Profile', icon: UsersIcon },
]

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode
}): Promise<ReactElement> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?redirect=/dashboard')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, company_name')
        .eq('id', user.id)
        .single()

    const navItems = profile?.role === 'supplier' ? SUPPLIER_NAV : VENDOR_NAV

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 border-r border-border bg-muted/30 p-4 md:block">
                <div className="mb-6">
                    <p className="text-sm font-semibold text-foreground">{profile?.company_name ?? 'Dashboard'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile?.role ?? 'user'} account</p>
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </div>
    )
}
