// This file declares TypeScript types for all environment variables used in the app.
// Generated to support strict TypeScript checking during Docker builds.

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string

      // Database
      DATABASE_URL: string
      POSTGRES_USER?: string
      POSTGRES_PASSWORD?: string
      POSTGRES_DB?: string

      // LLM
      LLM_BASE_URL: string
      LLM_MODEL: string
      LLM_API_KEY?: string

      // Embeddings
      HF_EMBEDDING_MODEL: string

      // Azure
      AZURE_CLIENT_ID?: string
      AZURE_TENANT_ID?: string
      AZURE_CLIENT_SECRET?: string
      APPLICATIONINSIGHTS_CONNECTION_STRING?: string

      // Web Search
      BRAVE_SEARCH_API_KEY?: string
      SEARXNG_URL?: string

      // RAG / Crawling
      FIRECRAWL_API_KEY?: string
      RAG_ADMIN_API_KEY: string
      ZYTE_API_KEY?: string

      // Crawlers - NAFDAC
      NAFDAC_MAX_PAGES?: string
      NAFDAC_MIN_PRIORITY?: string
      NAFDAC_CONCURRENCY?: string

      // Crawlers - Customs
      CUSTOMS_MAX_PAGES?: string
      CUSTOMS_MIN_PRIORITY?: string
      CUSTOMS_CONCURRENCY?: string

      // Crawlers - BFARM
      BFARM_MAX_PAGES?: string
      BFARM_MIN_PRIORITY?: string
      BFARM_CONCURRENCY?: string

      // DigitalOcean
      DO_REGISTRY_TOKEN?: string
      DO_REGISTRY_USERNAME?: string

      // Stitch MCP
      STITCH_MCP_URL?: string
      STITCH_API_KEY?: string

      // App
      NEXT_PUBLIC_APP_URL?: string
      UPLOADS_DIR?: string
      CI?: string
    }
  }
}

export {}
