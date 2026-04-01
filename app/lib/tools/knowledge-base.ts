import { tool } from 'ai'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding } from '@/app/lib/embeddings'

/**
 * RAG Knowledge Base Retrieval Tool
 * Searches the vector store for relevant pharmaceutical regulatory documents,
 * platform knowledge, and previously ingested content.
 */
export const knowledgeBaseTool = tool({
    description: 'Search the PharmConnect knowledge base for regulatory information, NAFDAC guidelines, German export regulations, customs procedures, HS codes, and pharmaceutical import/export documentation. Use this tool whenever the user asks about regulations, certifications, required documents, or import/export procedures.',
    parameters: z.object({
        query: z.string().describe('The search query — describe what information you need'),
        sourceFilter: z.enum(['regulatory', 'platform', 'web', 'upload']).optional()
            .describe('Optional filter to narrow results by source type'),
        maxResults: z.number().min(1).max(10).optional()
            .describe('Number of results to return (default 5)'),
    }),
    execute: async ({ query, sourceFilter, maxResults }) => {
        const embedding = await generateEmbedding(query)
        const supabase = createAdminClient()

        const { data, error } = await supabase.rpc('match_chunks_by_source', {
            query_embedding: JSON.stringify(embedding),
            source_filter: sourceFilter ?? null,
            match_threshold: 0.4,
            match_count: maxResults ?? 5,
        })

        if (error) {
            return { error: `Knowledge base search failed: ${error.message}`, results: [] }
        }

        if (!data || data.length === 0) {
            return {
                message: 'No relevant documents found in the knowledge base for this query.',
                results: [],
            }
        }

        const results = (data as {
            id: string
            document_id: string
            content: string
            document_title: string
            source_type: string
            similarity: number
        }[]).map((chunk) => ({
            title: chunk.document_title,
            sourceType: chunk.source_type,
            content: chunk.content,
            relevance: Math.round(chunk.similarity * 100) + '%',
        }))

        return {
            message: `Found ${results.length} relevant document(s).`,
            results,
        }
    },
})
