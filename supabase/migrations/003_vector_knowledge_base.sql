-- RAG Knowledge Base: pgvector for document embeddings
-- Requires pgvector extension (available on Supabase)

create extension if not exists vector;

-- ============================================================================
-- KNOWLEDGE BASE DOCUMENTS (source documents for RAG)
-- ============================================================================
create table public.knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  source_type text not null check (source_type in ('regulatory', 'platform', 'web', 'upload')),
  source_url text,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_knowledge_documents_source_type on public.knowledge_documents(source_type);

-- ============================================================================
-- DOCUMENT CHUNKS (embedded text segments)
-- ============================================================================
create table public.document_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(1024),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_document_chunks_document on public.document_chunks(document_id);

-- HNSW index for fast similarity search
create index idx_document_chunks_embedding on public.document_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ============================================================================
-- SIMILARITY SEARCH FUNCTION
-- ============================================================================
create or replace function match_document_chunks(
  query_embedding vector(1024),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- FILTERED SIMILARITY SEARCH (by source type)
-- ============================================================================
create or replace function match_chunks_by_source(
  query_embedding vector(1024),
  source_filter text default null,
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  document_title text,
  source_type text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    kd.title as document_title,
    kd.source_type,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  join public.knowledge_documents kd on kd.id = dc.document_id
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
    and (source_filter is null or kd.source_type = source_filter)
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS: knowledge base is readable by all authenticated users
alter table public.knowledge_documents enable row level security;
alter table public.document_chunks enable row level security;

create policy "Knowledge documents are viewable by everyone"
  on public.knowledge_documents for select using (true);

create policy "Document chunks are viewable by everyone"
  on public.document_chunks for select using (true);

-- Only service role can insert/update/delete knowledge base
create policy "Service role can manage knowledge documents"
  on public.knowledge_documents for all
  using (auth.role() = 'service_role');

create policy "Service role can manage document chunks"
  on public.document_chunks for all
  using (auth.role() = 'service_role');

-- Auto-update trigger
create trigger knowledge_documents_updated_at before update on public.knowledge_documents
  for each row execute procedure public.update_updated_at();
