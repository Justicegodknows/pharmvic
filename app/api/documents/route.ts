import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('uploaded_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(documents)
}

export async function POST(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const docType = formData.get('doc_type') as string | null

    if (!file || !docType) {
        return NextResponse.json({ error: 'File and doc_type required' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

    const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
            vendor_id: vendor.id,
            doc_type: docType,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size,
        })
        .select()
        .single()

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(doc, { status: 201 })
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

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Only delete if the document belongs to this vendor
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('vendor_id', vendor.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
