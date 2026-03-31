import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get vendor record
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('*, suppliers:supplier_id(company_name)')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
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

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor record not found' }, { status: 404 })
    }

    const { data, error } = await supabase
        .from('inquiries')
        .insert({
            vendor_id: vendor.id,
            supplier_id: body.supplier_id,
            subject: body.subject,
            message: body.message,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
