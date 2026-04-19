import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request): Promise<Response> {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const redirect = searchParams.get('redirect') ?? '/dashboard'

    if (code) {
        try {
            const supabase = await createClient()
            const { error, data } = await supabase.auth.exchangeCodeForSession(code)

            if (!error && data.user) {
                const user = data.user
                const meta = user.user_metadata as {
                    full_name?: string
                    role?: string
                    company_name?: string
                }

                const role = meta.role ?? 'vendor'
                const country = role === 'supplier' ? 'Germany' : 'Nigeria'

                // Create profile in Docker PostgreSQL (idempotent — ignore if already exists)
                try {
                    await sql`
                        INSERT INTO profiles (id, email, full_name, role, company_name, country)
                        VALUES (
                            ${user.id},
                            ${user.email ?? ''},
                            ${meta.full_name ?? ''},
                            ${role},
                            ${meta.company_name ?? ''},
                            ${country}
                        )
                        ON CONFLICT (id) DO NOTHING
                    `
                } catch { }

                return NextResponse.redirect(`${origin}${redirect}`)
            }
        } catch {
            // fall through to error redirect
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
