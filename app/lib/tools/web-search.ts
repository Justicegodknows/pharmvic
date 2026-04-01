import { tool } from 'ai'
import { z } from 'zod'

/**
 * Web Search Tool using SearXNG or Brave Search API.
 * Falls back to a simple fetch-based approach if no API is configured.
 */
export const webSearchTool = tool({
    description: 'Search the web for current information about pharmaceutical regulations, NAFDAC updates, German export rules, drug pricing, HS codes, or any topic the user asks about. Use this when the knowledge base does not have enough information or the user needs the latest data.',
    parameters: z.object({
        query: z.string().describe('The search query to look up on the web'),
        maxResults: z.number().min(1).max(10).optional()
            .describe('Maximum number of search results to return (default 5)'),
    }),
    execute: async ({ query, maxResults }) => {
        const numResults = maxResults ?? 5

        // Try Brave Search API first
        const braveApiKey = process.env.BRAVE_SEARCH_API_KEY
        if (braveApiKey) {
            return await braveSearch(query, numResults, braveApiKey)
        }

        // Try SearXNG instance
        const searxngUrl = process.env.SEARXNG_URL
        if (searxngUrl) {
            return await searxngSearch(query, numResults, searxngUrl)
        }

        return {
            error: 'No web search API configured. Set BRAVE_SEARCH_API_KEY or SEARXNG_URL in environment variables.',
            results: [],
        }
    },
})

async function braveSearch(query: string, maxResults: number, apiKey: string) {
    const url = new URL('https://api.search.brave.com/res/v1/web/search')
    url.searchParams.set('q', query)
    url.searchParams.set('count', String(maxResults))

    const response = await fetch(url.toString(), {
        headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': apiKey,
        },
    })

    if (!response.ok) {
        return { error: `Brave Search failed: ${response.status}`, results: [] }
    }

    const data = await response.json() as {
        web?: {
            results?: {
                title: string
                url: string
                description: string
            }[]
        }
    }

    const results = (data.web?.results ?? []).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
    }))

    return {
        message: `Found ${results.length} web result(s) for "${query}".`,
        results,
    }
}

async function searxngSearch(query: string, maxResults: number, baseUrl: string) {
    const url = new URL('/search', baseUrl)
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'json')
    url.searchParams.set('engines', 'google,duckduckgo,bing')

    const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
        return { error: `SearXNG search failed: ${response.status}`, results: [] }
    }

    const data = await response.json() as {
        results?: {
            title: string
            url: string
            content: string
        }[]
    }

    const results = (data.results ?? []).slice(0, maxResults).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
    }))

    return {
        message: `Found ${results.length} web result(s) for "${query}".`,
        results,
    }
}
