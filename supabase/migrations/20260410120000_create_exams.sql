-- Run in Supabase SQL Editor or via CLI. Exams for admin wizard + dashboard.

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  total_users integer,
  total_slots integer,
  question_sets_count integer,
  question_type text,
  start_time text,
  end_time text,
  duration_minutes integer not null default 0,
  questions jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exams_created_at_idx on public.exams (created_at desc);

alter table public.exams enable row level security;

-- Intentionally no policies: only the service role (Next.js API with secret key) accesses this table.
