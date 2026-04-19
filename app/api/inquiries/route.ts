import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    // Auth via Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get vendor record from Docker DB
    let vendor: { id: string } | undefined
    try {
        ;[vendor] = await sql`
            SELECT id FROM vendors WHERE user_id = ${user.id} LIMIT 1
        `
    } catch {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    let inquiries: unknown[]
    try {
        inquiries = await sql`
            SELECT i.*, s.company_name AS supplier_company_name
            FROM inquiries i
            JOIN suppliers s ON s.id = i.supplier_id
            WHERE i.vendor_id = ${vendor.id}
            ORDER BY i.created_at DESC
        `
    } catch {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    return NextResponse.json(inquiries)
}

export async function POST(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
        supplier_id: string
        subject: string
        message: string
    }

    if (!body.supplier_id || !body.subject || !body.message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let vendor: { id: string } | undefined
    try {
        ;[vendor] = await sql`
            SELECT id FROM vendors WHERE user_id = ${user.id} LIMIT 1
        `
    } catch {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor record not found' }, { status: 404 })
    }

    let data: unknown
    try {
        ;[data] = await sql`
            INSERT INTO inquiries (vendor_id, supplier_id, subject, message)
            VALUES (${vendor.id}, ${body.supplier_id}, ${body.subject}, ${body.message})
            RETURNING *
        `
    } catch {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    return NextResponse.json(data, { status: 201 })
}

