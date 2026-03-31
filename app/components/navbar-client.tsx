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
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>

            {/* Desktop auth buttons */}
            <div className="hidden items-center gap-3 md:flex">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/auth/register">Register</Link>
                        </Button>
                    </>
                )}
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="absolute left-0 top-16 z-50 w-full border-b border-border bg-background p-4 md:hidden">
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
