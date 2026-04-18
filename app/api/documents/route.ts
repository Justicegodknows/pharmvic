import { createClient } from '@/lib/supabase/server'
import sql from '@/lib/db/client'
import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

// Uploads are stored in a Docker volume mounted at /app/uploads (prod)
// or the project root uploads/ directory (dev).
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads')

export async function GET(): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [vendor] = await sql`
        SELECT id FROM vendors WHERE user_id = ${user.id} LIMIT 1
    `

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const documents = await sql`
        SELECT * FROM documents
        WHERE vendor_id = ${vendor.id}
        ORDER BY uploaded_at DESC
    `

    return NextResponse.json(documents)
}

export async function POST(request: Request): Promise<Response> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [vendor] = await sql`
        SELECT id FROM vendors WHERE user_id = ${user.id} LIMIT 1
    `

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const docType = formData.get('doc_type') as string | null

    if (!file || !docType) {
        return NextResponse.json({ error: 'File and doc_type required' }, { status: 400 })
    }

    // Save file to local uploads volume
    const relativePath = `${user.id}/${Date.now()}-${file.name}`
    const absolutePath = join(UPLOADS_DIR, relativePath)

    await mkdir(join(UPLOADS_DIR, user.id), { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(absolutePath, buffer)

    const [doc] = await sql`
        INSERT INTO documents (vendor_id, doc_type, file_name, file_path, file_size)
        VALUES (${vendor.id}, ${docType}, ${file.name}, ${relativePath}, ${file.size})
        RETURNING *
    `

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

    const [vendor] = await sql`
        SELECT id FROM vendors WHERE user_id = ${user.id} LIMIT 1
    `

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Fetch the record first to get the file path, and verify ownership
    const [doc] = await sql`
        SELECT id, file_path FROM documents
        WHERE id = ${id} AND vendor_id = ${vendor.id}
        LIMIT 1
    `

    if (!doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from DB then remove file from disk (best-effort)
    await sql`DELETE FROM documents WHERE id = ${id}`

    try {
        await unlink(join(UPLOADS_DIR, doc.file_path as string))
    } catch {
        // File may already be gone; don't fail the request
    }

    return NextResponse.json({ success: true })
}
