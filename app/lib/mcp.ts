import { createMCPClient } from '@ai-sdk/mcp'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>

let cachedClient: MCPClient | null = null
let cachedUrl: string | null = null

/**
 * Returns a cached MCP client connected to the Stitch MCP server, creating it
 * on first call.  The client is reused across requests within the same server
 * process, avoiding the overhead of re-connecting on every request.
 *
 * Set STITCH_MCP_URL in your environment to point at a running Stitch MCP
 * HTTP server (e.g. one started with `npx @_davideast/stitch-mcp proxy --http`).
 *
 * Returns null when STITCH_MCP_URL is not configured so callers can skip
 * Stitch tools gracefully.
 */
export async function getStitchMCPClient(): Promise<MCPClient | null> {
    const stitchUrl = process.env.STITCH_MCP_URL
    if (!stitchUrl) {
        return null
    }

    // Recreate client if the URL has changed (e.g. during development)
    if (cachedClient && cachedUrl === stitchUrl) {
        return cachedClient
    }

    const transport = new StreamableHTTPClientTransport(new URL(stitchUrl))
    cachedClient = await createMCPClient({ transport })
    cachedUrl = stitchUrl

    return cachedClient
}
