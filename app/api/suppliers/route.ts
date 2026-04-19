import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    type SupplierRow = Record<string, unknown>
    let suppliers: SupplierRow[] = []
    try {
        suppliers = (await sql`
            SELECT id, company_name, description, certifications, verified, logo_url, country
            FROM suppliers
            ORDER BY verified DESC, company_name ASC
        `) as unknown as SupplierRow[]
    } catch {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    return NextResponse.json(suppliers)
}

export async function POST(request: Request): Promise<Response> {
    // Auth check via Supabase
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

    type SupplierRow = Record<string, unknown>
    let data: SupplierRow | undefined
    try {
        ;[data] = (await sql`
            INSERT INTO suppliers (
                user_id, company_name, description, address, website,
                founded_year, export_markets, certifications
            ) VALUES (
                ${user.id},
                ${body.company_name},
                ${body.description ?? null},
                ${body.address ?? null},
                ${body.website ?? null},
                ${body.founded_year ?? null},
                ${body.export_markets ?? []},
                ${body.certifications ?? []}
            )
            RETURNING *
        `) as unknown as SupplierRow[]
    } catch {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    return NextResponse.json(data ?? null, { status: 201 })
}
