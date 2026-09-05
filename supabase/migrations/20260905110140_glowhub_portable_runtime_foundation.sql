create extension if not exists pgcrypto;

create table if not exists public.glowhub_records (
  table_name text not null,
  id text not null default gen_random_uuid()::text,
  record jsonb not null default '{}'::jsonb,
  created_at bigint not null default (extract(epoch from clock_timestamp()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from clock_timestamp()) * 1000)::bigint,
  primary key (table_name, id)
);

create index if not exists glowhub_records_table_created_idx
  on public.glowhub_records (table_name, created_at, id);
create index if not exists glowhub_records_record_gin_idx
  on public.glowhub_records using gin (record jsonb_path_ops);

create table if not exists public.glowhub_object_index (
  path text primary key,
  content_type text not null default 'application/octet-stream',
  content_text text,
  created_at bigint not null default (extract(epoch from clock_timestamp()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from clock_timestamp()) * 1000)::bigint
);
create index if not exists glowhub_object_index_path_pattern_idx
  on public.glowhub_object_index (path text_pattern_ops);

alter table public.glowhub_records enable row level security;
alter table public.glowhub_object_index enable row level security;

-- No anon/authenticated policies are created deliberately.
-- All writes go through the Glow Hub Edge API, which performs tenant membership checks.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'glowhub-assets',
  'glowhub-assets',
  false,
  8388608,
  array['application/json','text/plain','image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
