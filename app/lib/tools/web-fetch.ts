import { tool } from 'ai'
import { z } from 'zod'

const MAX_CONTENT_LENGTH = 8000

/**
 * Web Page Fetch Tool
 * Fetches and extracts readable text content from a URL.
 * Used for reading regulatory pages, supplier websites, or document links.
 */
export const webFetchTool = tool({
    description: 'Fetch and read the content of a specific web page URL. Use this to read regulatory documents, NAFDAC pages, German authority websites, supplier pages, or any URL referenced in search results or by the user.',
    inputSchema: z.object({
        url: z.string().url().describe('The URL of the web page to fetch and read'),
    }),
    execute: async ({ url }) => {
        // Validate URL is HTTP(S)
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { error: 'Only HTTP and HTTPS URLs are supported', content: '' }
        }

        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 15000)

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'PharmConnect-Agent/1.0 (pharmaceutical trade platform)',
                    'Accept': 'text/html,application/xhtml+xml,text/plain',
                },
                signal: controller.signal,
                redirect: 'follow',
            })

            clearTimeout(timeout)

            if (!response.ok) {
                return { error: `Failed to fetch URL (${response.status})`, content: '' }
            }

            const contentType = response.headers.get('content-type') ?? ''

            // Handle plain text
            if (contentType.includes('text/plain')) {
                const text = await response.text()
                return {
                    url,
                    title: url,
                    content: text.slice(0, MAX_CONTENT_LENGTH),
                    truncated: text.length > MAX_CONTENT_LENGTH,
                }
            }

            // Handle HTML — extract readable text
            const html = await response.text()
            const extracted = extractTextFromHtml(html)

            return {
                url,
                title: extracted.title,
                content: extracted.text.slice(0, MAX_CONTENT_LENGTH),
                truncated: extracted.text.length > MAX_CONTENT_LENGTH,
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                return { error: 'Request timed out after 15 seconds', content: '' }
            }
            const message = err instanceof Error ? err.message : 'Unknown fetch error'
            return { error: message, content: '' }
        }
    },
})

/**
 * Basic HTML text extraction without external dependencies.
 * Strips tags, scripts, styles, and normalizes whitespace.
 */
function extractTextFromHtml(html: string): { title: string; text: string } {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : ''

    // Remove script and style blocks
    let text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, ' ')

    // Add newlines for block elements
    text = text.replace(/<\/?(h[1-6]|p|div|br|li|tr|td|th|blockquote|pre|section|article)[^>]*>/gi, '\n')

    // Strip remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ')

    // Decode common HTML entities
    text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')

    // Normalize whitespace
    text = text
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n')

    return { title, text }
}
