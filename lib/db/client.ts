import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
}

// Singleton pattern: reuse the connection pool in dev hot-reload and prod
declare global {
    // eslint-disable-next-line no-var
    var _pgClient: ReturnType<typeof postgres> | undefined
}

const sql: ReturnType<typeof postgres> =
    global._pgClient ??
    postgres(DATABASE_URL, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        // Transform snake_case columns to camelCase is opt-out — keep snake_case
        // to match existing query conventions across the codebase.
    })

if (process.env.NODE_ENV !== 'production') {
    global._pgClient = sql
}

export default sql
