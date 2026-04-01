import { NextResponse } from 'next/server'
import { ingestDocument, listKnowledgeDocuments, deleteKnowledgeDocument } from '@/app/lib/rag-ingest'

/**
 * GET /api/agent/knowledge — list all knowledge base documents
 */
export async function GET(): Promise<Response> {
    try {
        const docs = await listKnowledgeDocuments()
        return NextResponse.json(docs)
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

/**
 * POST /api/agent/knowledge — ingest a new document into the knowledge base
 *
 * Body: { title, content, sourceType, sourceUrl?, metadata? }
 */
export async function POST(request: Request): Promise<Response> {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.RAG_ADMIN_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
        title?: string
        content?: string
        sourceType?: string
        sourceUrl?: string
        metadata?: Record<string, unknown>
    }

    if (!body.title || !body.content || !body.sourceType) {
        return NextResponse.json(
            { error: 'title, content, and sourceType are required' },
            { status: 400 }
        )
    }

    const validTypes = ['regulatory', 'platform', 'web', 'upload']
    if (!validTypes.includes(body.sourceType)) {
        return NextResponse.json(
            { error: `sourceType must be one of: ${validTypes.join(', ')}` },
            { status: 400 }
        )
    }

    try {
        const result = await ingestDocument({
            title: body.title,
            content: body.content,
            sourceType: body.sourceType as 'regulatory' | 'platform' | 'web' | 'upload',
            sourceUrl: body.sourceUrl,
            metadata: body.metadata,
        })
        return NextResponse.json(result, { status: 201 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

/**
 * DELETE /api/agent/knowledge — remove a document from the knowledge base
 *
 * Body: { documentId }
 */
export async function DELETE(request: Request): Promise<Response> {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.RAG_ADMIN_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { documentId?: string }

    if (!body.documentId) {
        return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    try {
        await deleteKnowledgeDocument(body.documentId)
        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
