import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbeddings } from '@/app/lib/embeddings'
import { chunkText } from '@/app/lib/chunking'

export type IngestDocumentInput = {
    title: string
    content: string
    sourceType: 'regulatory' | 'platform' | 'web' | 'upload'
    sourceUrl?: string
    metadata?: Record<string, unknown>
}

export type IngestResult = {
    documentId: string
    chunksCreated: number
}

/**
 * Ingest a document into the RAG knowledge base:
 * 1. Store the source document
 * 2. Chunk the content
 * 3. Generate embeddings for each chunk
 * 4. Store chunks with embeddings in pgvector
 */
export async function ingestDocument(input: IngestDocumentInput): Promise<IngestResult> {
    const supabase = createAdminClient()

    // 1. Insert the source document
    const { data: doc, error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
            title: input.title,
            content: input.content,
            source_type: input.sourceType,
            source_url: input.sourceUrl ?? null,
            metadata: input.metadata ?? {},
        })
        .select('id')
        .single()

    if (docError || !doc) {
        throw new Error(`Failed to insert document: ${docError?.message}`)
    }

    // 2. Chunk the content
    const chunks = chunkText(input.content, {
        metadata: {
            documentId: doc.id,
            title: input.title,
            sourceType: input.sourceType,
        },
    })

    if (chunks.length === 0) {
        return { documentId: doc.id, chunksCreated: 0 }
    }

    // 3. Generate embeddings in batches
    const BATCH_SIZE = 10
    const allChunkRows: {
        document_id: string
        chunk_index: number
        content: string
        embedding: string
        metadata: Record<string, unknown>
    }[] = []

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE)
        const texts = batch.map((c) => c.content)
        const embeddings = await generateEmbeddings(texts)

        for (let j = 0; j < batch.length; j++) {
            allChunkRows.push({
                document_id: doc.id,
                chunk_index: batch[j].chunkIndex,
                content: batch[j].content,
                embedding: JSON.stringify(embeddings[j]),
                metadata: batch[j].metadata,
            })
        }
    }

    // 4. Insert chunks with embeddings
    const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert(allChunkRows)

    if (chunkError) {
        throw new Error(`Failed to insert chunks: ${chunkError.message}`)
    }

    return { documentId: doc.id, chunksCreated: allChunkRows.length }
}

/**
 * Delete a knowledge document and all its chunks (cascade).
 */
export async function deleteKnowledgeDocument(documentId: string): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', documentId)

    if (error) {
        throw new Error(`Failed to delete document: ${error.message}`)
    }
}

/**
 * List all knowledge documents.
 */
export async function listKnowledgeDocuments() {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('knowledge_documents')
        .select('id, title, source_type, source_url, metadata, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(`Failed to list documents: ${error.message}`)
    }

    return data
}
