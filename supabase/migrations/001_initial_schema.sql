-- PharmConnect Database Schema
-- Supabase PostgreSQL with RLS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null check (role in ('vendor', 'supplier', 'admin')) default 'vendor',
  company_name text not null default '',
  country text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_country on public.profiles(country);

-- ============================================================================
-- SUPPLIERS (German pharma manufacturers/exporters)
-- ============================================================================
create table public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  country text not null default 'Germany',
  description text,
  address text,
  website text,
  founded_year integer,
  export_markets text[] default '{}',
  certifications text[] default '{}',
  verified boolean not null default false,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_user_unique unique (user_id)
);

create index idx_suppliers_verified on public.suppliers(verified);
create index idx_suppliers_certifications on public.suppliers using gin(certifications);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  description text,
  hs_code text,
  category text not null,
  min_order_qty integer,
  unit text default 'units',
  certifications text[] default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_supplier on public.products(supplier_id);
create index idx_products_category on public.products(category);
create index idx_products_hs_code on public.products(hs_code);

-- ============================================================================
-- VENDORS (Nigerian pharma vendors)
-- ============================================================================
create table public.vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  country text not null default 'Nigeria',
  nafdac_number text,
  import_permit text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_user_unique unique (user_id)
);

-- ============================================================================
-- INQUIRIES
-- ============================================================================
create table public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null check (status in ('pending', 'responded', 'closed')) default 'pending',
  response text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inquiries_vendor on public.inquiries(vendor_id);
create index idx_inquiries_supplier on public.inquiries(supplier_id);
create index idx_inquiries_status on public.inquiries(status);

-- ============================================================================
-- DOCUMENTS (vendor document vault)
-- ============================================================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  doc_type text not null,
  file_name text not null,
  file_url text not null,
  file_size integer,
  uploaded_at timestamptz not null default now()
);

create index idx_documents_vendor on public.documents(vendor_id);

-- ============================================================================
-- CHAT SESSIONS
-- ============================================================================
create table public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'New Chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_chat_sessions_user on public.chat_sessions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Profiles: users can read all profiles, only update their own
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Suppliers: public read, owner write
alter table public.suppliers enable row level security;

create policy "Suppliers are viewable by everyone"
  on public.suppliers for select using (true);

create policy "Supplier owners can insert"
  on public.suppliers for insert with check (auth.uid() = user_id);

create policy "Supplier owners can update"
  on public.suppliers for update using (auth.uid() = user_id);

create policy "Supplier owners can delete"
  on public.suppliers for delete using (auth.uid() = user_id);

-- Products: public read, supplier owner write
alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select using (true);

create policy "Supplier owners can manage products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.suppliers
      where suppliers.id = products.supplier_id
        and suppliers.user_id = auth.uid()
    )
  );

create policy "Supplier owners can update products"
  on public.products for update
  using (
    exists (
      select 1 from public.suppliers
      where suppliers.id = products.supplier_id
        and suppliers.user_id = auth.uid()
    )
  );

create policy "Supplier owners can delete products"
  on public.products for delete
  using (
    exists (
      select 1 from public.suppliers
      where suppliers.id = products.supplier_id
        and suppliers.user_id = auth.uid()
    )
  );

-- Vendors: owner read/write, suppliers can see vendors who inquired
alter table public.vendors enable row level security;

create policy "Vendors can view own record"
  on public.vendors for select using (auth.uid() = user_id);

create policy "Vendor owners can insert"
  on public.vendors for insert with check (auth.uid() = user_id);

create policy "Vendor owners can update"
  on public.vendors for update using (auth.uid() = user_id);

-- Inquiries: vendor and supplier can see their own
alter table public.inquiries enable row level security;

create policy "Vendors can view own inquiries"
  on public.inquiries for select
  using (
    exists (
      select 1 from public.vendors
      where vendors.id = inquiries.vendor_id
        and vendors.user_id = auth.uid()
    )
  );

create policy "Suppliers can view inquiries sent to them"
  on public.inquiries for select
  using (
    exists (
      select 1 from public.suppliers
      where suppliers.id = inquiries.supplier_id
        and suppliers.user_id = auth.uid()
    )
  );

create policy "Vendors can create inquiries"
  on public.inquiries for insert
  with check (
    exists (
      select 1 from public.vendors
      where vendors.id = inquiries.vendor_id
        and vendors.user_id = auth.uid()
    )
  );

create policy "Suppliers can update inquiry status"
  on public.inquiries for update
  using (
    exists (
      select 1 from public.suppliers
      where suppliers.id = inquiries.supplier_id
        and suppliers.user_id = auth.uid()
    )
  );

-- Documents: vendor-only access
alter table public.documents enable row level security;

create policy "Vendors can manage own documents"
  on public.documents for all
  using (
    exists (
      select 1 from public.vendors
      where vendors.id = documents.vendor_id
        and vendors.user_id = auth.uid()
    )
  );

-- Chat sessions: user-only access
alter table public.chat_sessions enable row level security;

create policy "Users can manage own chat sessions"
  on public.chat_sessions for all
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'vendor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at columns
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger suppliers_updated_at before update on public.suppliers
  for each row execute procedure public.update_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute procedure public.update_updated_at();
create trigger vendors_updated_at before update on public.vendors
  for each row execute procedure public.update_updated_at();
create trigger inquiries_updated_at before update on public.inquiries
  for each row execute procedure public.update_updated_at();
create trigger chat_sessions_updated_at before update on public.chat_sessions
  for each row execute procedure public.update_updated_at();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies: vendors can upload/read their own docs
create policy "Vendors can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Vendors can view own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Vendors can delete own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
