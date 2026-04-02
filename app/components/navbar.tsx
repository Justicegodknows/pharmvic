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
        <header className="sticky top-0 z-50 w-full glass-nav">
            <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold tracking-tight font-headline text-[#000F22]">
                        PharmConnect
                    </Link>
                    <span className="hidden h-6 w-px bg-[#C4C6CE]/20 md:block" />
                    <nav className="hidden items-center gap-6 md:flex">
                        <Link href="/marketplace" className="font-headline font-bold tracking-tight text-muted-foreground transition-colors hover:bg-[#E6E8EA] px-2 rounded">
                            Marketplace
                        </Link>
                        <Link href="/regulatory-guide" className="font-headline font-bold tracking-tight text-muted-foreground transition-colors hover:bg-[#E6E8EA] px-2 rounded">
                            Compliance
                        </Link>
                        <Link href="/agent-chat" className="font-headline font-bold tracking-tight text-secondary">
                            PharmAgent
                        </Link>
                    </nav>
                </div>

                <NavbarClient user={user ? { email: user.email ?? '', name: profile?.full_name ?? '' } : null} />
            </div>
        </header>
    )
}
