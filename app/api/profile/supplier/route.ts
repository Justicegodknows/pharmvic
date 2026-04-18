import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'

/**
 * GET /api/profile/supplier — get the current user's supplier record.
 */
export async function GET(): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [supplier] = await sql`
        SELECT * FROM suppliers WHERE user_id = ${user.id} LIMIT 1
    `

    if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json(supplier)
}

/**
 * PUT /api/profile/supplier — upsert the current user's supplier record.
 */
export async function PUT(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
        company_name: string
        description?: string
        address?: string
        website?: string
        founded_year?: number
        export_markets?: string[]
        certifications?: string[]
    }

    if (!body.company_name) {
        return NextResponse.json({ error: 'company_name required' }, { status: 400 })
    }

    const [supplier] = await sql`
        INSERT INTO suppliers (user_id, company_name, description, address, website, founded_year, export_markets, certifications)
        VALUES (
            ${user.id},
            ${body.company_name},
            ${body.description ?? null},
            ${body.address ?? null},
            ${body.website ?? null},
            ${body.founded_year ?? null},
            ${body.export_markets ?? []},
            ${body.certifications ?? []}
        )
        ON CONFLICT (user_id) DO UPDATE SET
            company_name   = EXCLUDED.company_name,
            description    = EXCLUDED.description,
            address        = EXCLUDED.address,
            website        = EXCLUDED.website,
            founded_year   = EXCLUDED.founded_year,
            export_markets = EXCLUDED.export_markets,
            certifications = EXCLUDED.certifications,
            updated_at     = now()
        RETURNING *
    `

    return NextResponse.json(supplier)
}
