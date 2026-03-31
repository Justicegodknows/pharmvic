import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    const supabase = await createClient()

    const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('id, company_name, description, certifications, verified, logo_url, country')
        .order('verified', { ascending: false })
        .order('company_name')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(suppliers)
}

export async function POST(request: Request): Promise<Response> {
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

    const { data, error } = await supabase
        .from('suppliers')
        .insert({
            user_id: user.id,
            company_name: body.company_name,
            description: body.description,
            address: body.address,
            website: body.website,
            founded_year: body.founded_year,
            export_markets: body.export_markets ?? [],
            certifications: body.certifications ?? [],
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
