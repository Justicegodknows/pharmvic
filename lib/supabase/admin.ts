import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client using the service role key.
 * Used for RAG operations that bypass RLS (ingestion, embedding writes).
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    return createSupabaseClient(url, serviceKey, {
        auth: { persistSession: false },
    })
}
