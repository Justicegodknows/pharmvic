import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ReactElement } from 'react'
import { NavbarClient } from './navbar-client'

export async function Navbar(): Promise<ReactElement> {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const user = data.user

    let profile: { role: string; full_name: string } | null = null
    if (user) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single()
        profile = profileData
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-sm font-bold text-primary-foreground">P</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                        Pharm<span className="text-primary">Connect</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <Link href="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Marketplace
                    </Link>
                    <Link href="/regulatory-guide" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Regulatory Guide
                    </Link>
                    <Link href="/agent-chat" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        PharmAgent
                    </Link>
                </nav>

                <NavbarClient user={user ? { email: user.email ?? '', name: profile?.full_name ?? '' } : null} />
            </div>
        </header>
    )
}
