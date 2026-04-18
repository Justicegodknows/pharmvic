import sql from '@/lib/db/client'
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
 * Ingest a document into the RAG knowledge base (Docker PostgreSQL + pgvector):
 * 1. Store the source document
 * 2. Chunk the content
 * 3. Generate embeddings for each chunk
 * 4. Store chunks with embeddings in pgvector
 */
export async function ingestDocument(input: IngestDocumentInput): Promise<IngestResult> {
    // 1. Insert the source document
    const [doc] = await sql`
        INSERT INTO knowledge_documents (title, content, source_type, source_url, metadata)
        VALUES (
            ${input.title},
            ${input.content},
            ${input.sourceType},
            ${input.sourceUrl ?? null},
            ${JSON.stringify(input.metadata ?? {})}
        )
        RETURNING id
    `

    if (!doc) {
        throw new Error('Failed to insert knowledge document')
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
        return { documentId: doc.id as string, chunksCreated: 0 }
    }

    // 3. Generate embeddings in batches
    const BATCH_SIZE = 10

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE)
        const texts = batch.map((c) => c.content)
        const embeddings = await generateEmbeddings(texts)

        // 4. Insert each chunk row — postgres tagged template handles parameterisation
        for (let j = 0; j < batch.length; j++) {
            await sql`
                INSERT INTO document_chunks (document_id, chunk_index, content, embedding, metadata)
                VALUES (
                    ${doc.id},
                    ${batch[j].chunkIndex},
                    ${batch[j].content},
                    ${JSON.stringify(embeddings[j])},
                    ${JSON.stringify(batch[j].metadata)}
                )
            `
        }
    }

    return { documentId: doc.id as string, chunksCreated: chunks.length }
}

/**
 * Delete a knowledge document and all its chunks (cascade).
 */
export async function deleteKnowledgeDocument(documentId: string): Promise<void> {
    await sql`DELETE FROM knowledge_documents WHERE id = ${documentId}`
}

/**
 * List all knowledge documents.
 */
export async function listKnowledgeDocuments() {
    return sql`
        SELECT id, title, source_type, source_url, metadata, created_at
        FROM knowledge_documents
        ORDER BY created_at DESC
    `
}

