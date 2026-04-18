/**
 * Zyte API v1 REST client (TypeScript, no Scrapy required).
 *
 * Docs: https://docs.zyte.com/zyte-api/usage/reference.html
 *
 * Usage:
 *   const client = new ZyteClient(process.env.ZYTE_API_KEY)
 *   const article = await client.extractArticle('https://example.com/page')
 *   const html    = await client.fetchBrowserHtml('https://example.com/page')
 */

const ZYTE_API_ENDPOINT = 'https://api.zyte.com/v1/extract'

export type ZyteArticle = {
    /** Canonical URL of the extracted article */
    url: string
    /** Article headline / title */
    headline?: string
    /** Plain-text body of the article */
    articleBody?: string
    /** Date published (ISO string) */
    datePublished?: string
    /** Site/publisher name */
    siteName?: string
}

export type ZyteExtractResult = {
    url: string
    /** Clean browser-rendered HTML (when browserHtml requested) */
    browserHtml?: string
    /** Structured article data (when article requested) */
    article?: ZyteArticle
    /** HTTP status code returned from the target site */
    httpResponseStatusCode?: number
}

export type ZyteExtractRequest = {
    url: string
    /** Request full browser-rendered HTML */
    browserHtml?: boolean
    /** Request Zyte AutoExtract article parsing */
    article?: boolean
    /** Override the geolocation (ISO 3166-1 alpha-2 country code) */
    geolocation?: string
    /** Custom HTTP headers to send to the target */
    customHttpRequestHeaders?: Array<{ name: string; value: string }>
}

/**
 * Minimal, typed wrapper around the Zyte API v1 `/extract` endpoint.
 * Uses HTTP Basic Auth (apiKey as username, empty password).
 */
export class ZyteClient {
    private readonly authHeader: string

    constructor(apiKey: string) {
        if (!apiKey) throw new Error('ZyteClient: ZYTE_API_KEY is required')
        // Zyte uses HTTP Basic Auth: key as username, empty password
        this.authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64')
    }

    /**
     * Low-level extraction call. Throws on non-2xx responses.
     */
    async extract(request: ZyteExtractRequest): Promise<ZyteExtractResult> {
        const response = await fetch(ZYTE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: this.authHeader,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const body = await response.text()
            throw new Error(
                `Zyte API error ${response.status} for ${request.url}: ${body.slice(0, 300)}`
            )
        }

        return response.json() as Promise<ZyteExtractResult>
    }

    /**
     * Extract structured article content from a URL.
     * Returns null when no article body could be extracted (e.g. index pages).
     */
    async extractArticle(url: string): Promise<ZyteArticle | null> {
        try {
            const result = await this.extract({ url, article: true })
            const article = result.article
            if (!article?.articleBody || article.articleBody.trim().length < 100) {
                return null
            }
            return article
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            // Log and return null so the caller can skip this URL gracefully
            console.warn(`  [Zyte] Article extract failed for ${url}: ${message}`)
            return null
        }
    }

    /**
     * Fetch full browser-rendered HTML from a URL.
     * Useful for pages with dynamic JS content or when article extraction fails.
     */
    async fetchBrowserHtml(url: string): Promise<string | null> {
        try {
            const result = await this.extract({ url, browserHtml: true })
            return result.browserHtml ?? null
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            console.warn(`  [Zyte] Browser HTML fetch failed for ${url}: ${message}`)
            return null
        }
    }

    /**
     * Batch-extract articles from multiple URLs with concurrency control.
     * Failed URLs are logged and skipped rather than crashing the batch.
     */
    async extractArticlesBatch(
        urls: string[],
        concurrency: number = 5
    ): Promise<Array<{ url: string; article: ZyteArticle | null }>> {
        const results: Array<{ url: string; article: ZyteArticle | null }> = []

        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency)
            const settled = await Promise.allSettled(
                batch.map(async (url) => ({
                    url,
                    article: await this.extractArticle(url),
                }))
            )

            for (const outcome of settled) {
                if (outcome.status === 'fulfilled') {
                    results.push(outcome.value)
                } else {
                    console.warn(`  [Zyte] Batch item failed: ${outcome.reason}`)
                }
            }
        }

        return results
    }
}
