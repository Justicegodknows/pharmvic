-- PharmConnect Docker PostgreSQL Initialization
-- This script runs on first container start via the postgres initdb.d mechanism.
-- Auth lives in Supabase; all business data lives here.

-- ─────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- user_id is the Supabase Auth UUID — stored without FK since
-- the auth schema lives in Supabase, not this database.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY,           -- Supabase auth user ID
  email       text NOT NULL,
  full_name   text NOT NULL DEFAULT '',
  role        text NOT NULL DEFAULT 'vendor'
                CHECK (role IN ('vendor', 'supplier', 'admin')),
  company_name text NOT NULL DEFAULT '',
  country     text NOT NULL DEFAULT '',
  phone       text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role    ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- ─────────────────────────────────────────────────────────────
-- SUPPLIERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name   text NOT NULL,
  country        text NOT NULL DEFAULT 'Germany',
  description    text,
  address        text,
  website        text,
  founded_year   integer,
  export_markets text[]  DEFAULT '{}',
  certifications text[]  DEFAULT '{}',
  verified       boolean NOT NULL DEFAULT false,
  logo_url       text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT suppliers_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_suppliers_verified       ON suppliers(verified);
CREATE INDEX IF NOT EXISTS idx_suppliers_certifications ON suppliers USING gin(certifications);

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id    uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name           text NOT NULL,
  description    text,
  hs_code        text,
  category       text NOT NULL,
  min_order_qty  integer,
  unit           text DEFAULT 'units',
  certifications text[] DEFAULT '{}',
  image_url      text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_hs_code  ON products(hs_code);

-- ─────────────────────────────────────────────────────────────
-- VENDORS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name   text NOT NULL,
  country        text NOT NULL DEFAULT 'Nigeria',
  nafdac_number  text,
  import_permit  text,
  address        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vendors_user_unique UNIQUE (user_id)
);

-- ─────────────────────────────────────────────────────────────
-- INQUIRIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id     uuid NOT NULL REFERENCES vendors(id)   ON DELETE CASCADE,
  supplier_id   uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  subject       text NOT NULL,
  message       text NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'responded', 'closed')),
  response      text,
  responded_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_vendor   ON inquiries(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_supplier ON inquiries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status   ON inquiries(status);

-- ─────────────────────────────────────────────────────────────
-- DOCUMENTS (vendor document vault — stored in local volume)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id   uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  doc_type    text NOT NULL,
  file_name   text NOT NULL,
  file_path   text NOT NULL,   -- relative path inside the uploads volume
  file_size   integer,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_vendor ON documents(vendor_id);

-- ─────────────────────────────────────────────────────────────
-- CHAT SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      text DEFAULT 'New Chat',
  messages   jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- ─────────────────────────────────────────────────────────────
-- KNOWLEDGE BASE DOCUMENTS (RAG source documents)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text NOT NULL,
  source_type text NOT NULL
                CHECK (source_type IN ('regulatory', 'platform', 'web', 'upload')),
  source_url  text,
  content     text NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source_type ON knowledge_documents(source_type);

-- ─────────────────────────────────────────────────────────────
-- DOCUMENT CHUNKS (pgvector embeddings for RAG)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_chunks (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content     text NOT NULL,
  embedding   vector(1024),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document ON document_chunks(document_id);

-- HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
  ON document_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ─────────────────────────────────────────────────────────────
-- SIMILARITY SEARCH FUNCTIONS
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.5,
  match_count     int   DEFAULT 5
)
RETURNS TABLE (
  id          uuid,
  document_id uuid,
  content     text,
  metadata    jsonb,
  similarity  float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION match_chunks_by_source(
  query_embedding vector(1024),
  source_filter   text  DEFAULT NULL,
  match_threshold float DEFAULT 0.5,
  match_count     int   DEFAULT 5
)
RETURNS TABLE (
  id             uuid,
  document_id    uuid,
  content        text,
  metadata       jsonb,
  document_title text,
  source_type    text,
  similarity     float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    kd.title  AS document_title,
    kd.source_type,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN knowledge_documents kd ON kd.id = dc.document_id
  WHERE
    (source_filter IS NULL OR kd.source_type = source_filter)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─────────────────────────────────────────────────────────────
-- AUTO-CREATE VENDOR/SUPPLIER RECORD ON PROFILE INSERT
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'vendor' THEN
    INSERT INTO vendors (user_id, company_name)
    VALUES (NEW.id, COALESCE(NULLIF(NEW.company_name, ''), 'My Company'))
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'supplier' THEN
    INSERT INTO suppliers (user_id, company_name)
    VALUES (NEW.id, COALESCE(NULLIF(NEW.company_name, ''), 'My Company'))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();
