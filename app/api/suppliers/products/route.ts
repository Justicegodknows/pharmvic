import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: supplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplier.id)
        .order('name')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(products)
}

export async function POST(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns a supplier
    const { data: supplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const body = await request.json() as {
        name: string
        description?: string
        hs_code?: string
        category: string
        min_order_qty?: number
        unit?: string
        certifications?: string[]
    }

    if (!body.name || !body.category) {
        return NextResponse.json({ error: 'name and category required' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            supplier_id: supplier.id,
            name: body.name,
            description: body.description,
            hs_code: body.hs_code,
            category: body.category,
            min_order_qty: body.min_order_qty,
            unit: body.unit,
            certifications: body.certifications ?? [],
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json() as { id: string }

    if (!id) {
        return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const { data: supplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Only delete if the product belongs to this supplier
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('supplier_id', supplier.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
