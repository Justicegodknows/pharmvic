import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'

/**
 * GET /api/profile — get the current user's profile from Docker PostgreSQL.
 * Auth is verified via Supabase JWT.
 */
export async function GET(): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [profile] = await sql`
        SELECT id, email, full_name, role, company_name, country, phone, avatar_url, created_at
        FROM profiles
        WHERE id = ${user.id}
        LIMIT 1
    `

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
}

/**
 * PATCH /api/profile — update the current user's profile fields.
 */
export async function PATCH(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
        full_name?: string
        company_name?: string
        country?: string
        phone?: string
    }

    const [profile] = await sql`
        UPDATE profiles SET
            full_name    = COALESCE(${body.full_name ?? null}, full_name),
            company_name = COALESCE(${body.company_name ?? null}, company_name),
            country      = COALESCE(${body.country ?? null}, country),
            phone        = COALESCE(${body.phone ?? null}, phone),
            updated_at   = now()
        WHERE id = ${user.id}
        RETURNING id, email, full_name, role, company_name, country, phone, avatar_url
    `

    return NextResponse.json(profile)
}
