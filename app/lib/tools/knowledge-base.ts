import { tool } from 'ai'
import { z } from 'zod'
import sql from '@/lib/db/client'
import { generateEmbedding } from '@/app/lib/embeddings'

/**
 * RAG Knowledge Base Retrieval Tool
 * Searches the vector store for relevant pharmaceutical regulatory documents,
 * platform knowledge, and previously ingested content.
 */
export const knowledgeBaseTool = tool({
    description: 'Search the PharmConnect knowledge base for regulatory information, NAFDAC guidelines, German export regulations, customs procedures, HS codes, and pharmaceutical import/export documentation. Use this tool whenever the user asks about regulations, certifications, required documents, or import/export procedures.',
    inputSchema: z.object({
        query: z.string().describe('The search query — describe what information you need'),
        sourceFilter: z.enum(['regulatory', 'platform', 'web', 'upload']).optional()
            .describe('Optional filter to narrow results by source type'),
        maxResults: z.number().min(1).max(10).optional()
            .describe('Number of results to return (default 5)'),
    }),
    execute: async ({ query, sourceFilter, maxResults }) => {
        const embedding = await generateEmbedding(query)
        const embeddingStr = JSON.stringify(embedding)
        const threshold = 0.4
        const limit = maxResults ?? 5

        const data = sourceFilter
            ? await sql`
                SELECT * FROM match_chunks_by_source(
                    ${embeddingStr}::vector(1024),
                    ${sourceFilter},
                    ${threshold},
                    ${limit}
                )
              `
            : await sql`
                SELECT
                    dc.id, dc.document_id, dc.content, dc.metadata,
                    kd.title AS document_title, kd.source_type,
                    1 - (dc.embedding <=> ${embeddingStr}::vector(1024)) AS similarity
                FROM document_chunks dc
                JOIN knowledge_documents kd ON kd.id = dc.document_id
                WHERE 1 - (dc.embedding <=> ${embeddingStr}::vector(1024)) > ${threshold}
                ORDER BY dc.embedding <=> ${embeddingStr}::vector(1024)
                LIMIT ${limit}
              `

        if (!data || data.length === 0) {
            return {
                message: 'No relevant documents found in the knowledge base for this query.',
                results: [],
            }
        }

        const results = data.map((chunk) => ({
            title: chunk.document_title as string,
            sourceType: chunk.source_type as string,
            content: chunk.content as string,
            relevance: Math.round((chunk.similarity as number) * 100) + '%',
        }))

        return {
            message: `Found ${results.length} relevant document(s).`,
            results,
        }
    },
})
