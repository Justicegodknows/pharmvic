'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactElement } from 'react'

export default function RegisterPage(): ReactElement {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [role, setRole] = useState<'vendor' | 'supplier'>('vendor')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    async function handleRegister(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role,
                    company_name: companyName,
                },
            },
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md p-8 text-center">
                    <h2 className="text-xl font-bold text-primary">Check your email</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Click it to activate your account.
                    </p>
                    <Button className="mt-6" onClick={() => router.push('/auth/login')}>
                        Go to Login
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-primary">PharmConnect</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Create your account
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Full Name
                        </label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium">
                            Company Name
                        </label>
                        <Input
                            id="companyName"
                            type="text"
                            placeholder="Your Pharma Ltd."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">
                            I am a
                        </label>
                        <Select value={role} onValueChange={(v) => setRole(v as 'vendor' | 'supplier')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vendor">Nigerian Pharma Vendor</SelectItem>
                                <SelectItem value="supplier">German Pharma Supplier</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </Card>
        </div>
    )
}
