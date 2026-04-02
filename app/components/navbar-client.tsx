'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ReactElement } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'

type NavbarClientProps = {
    user: { email: string; name: string } | null
}

export function NavbarClient({ user }: NavbarClientProps): ReactElement {
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)

    async function handleSignOut() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-[#E6E8EA] transition-colors md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>

            {/* Desktop auth buttons */}
            <div className="hidden items-center gap-4 md:flex">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-[#0A2540] text-sm font-bold text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white shadow-[0_12px_32px_rgba(25,28,30,0.06)]">
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSignOut}>
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:bg-[#E6E8EA]" asChild>
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button size="sm" className="rounded-full bg-[#000F22] px-6 font-bold text-white hover:opacity-90" asChild>
                            <Link href="/auth/register">Get Started</Link>
                        </Button>
                    </>
                )}
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="absolute left-0 top-16 z-50 w-full glass-nav p-4 md:hidden shadow-[0_12px_32px_rgba(25,28,30,0.06)]">
                    <nav className="flex flex-col gap-3">
                        <Link href="/marketplace" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                            Marketplace
                        </Link>
                        <Link href="/regulatory-guide" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                            Regulatory Guide
                        </Link>
                        <Link href="/agent-chat" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                            PharmAgent
                        </Link>
                        <hr className="border-border" />
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                                    Dashboard
                                </Link>
                                <button className="text-left text-sm font-medium text-destructive" onClick={handleSignOut}>
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                                    Sign In
                                </Link>
                                <Link href="/auth/register" className="text-sm font-medium text-primary" onClick={() => setMobileOpen(false)}>
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </>
    )
}
