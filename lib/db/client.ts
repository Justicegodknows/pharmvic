import postgres from 'postgres'

// Singleton — reused across dev hot-reloads and held for the process lifetime in prod.
declare global {
    // eslint-disable-next-line no-var
    var _pgClient: ReturnType<typeof postgres> | undefined
}

function getClient(): ReturnType<typeof postgres> {
    if (global._pgClient) return global._pgClient

    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required')
    }

    const client = postgres(DATABASE_URL, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
    })

    if (process.env.NODE_ENV !== 'production') {
        global._pgClient = client
    }

    return client
}

// Lazy proxy — the postgres client is only instantiated on the first query.
// This allows the module to be imported at Next.js build time without DATABASE_URL.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sql = new Proxy((() => { }) as unknown as ReturnType<typeof postgres>, {
    apply(_target, _thisArg, args) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (getClient() as any)(...args)
    },
    get(_target, prop) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (getClient() as any)[prop]
    },
})

export default sql
