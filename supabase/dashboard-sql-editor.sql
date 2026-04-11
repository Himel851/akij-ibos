-- =============================================================================
-- Supabase Dashboard → SQL Editor এ এই ফাইলের পুরোটা একবার পেস্ট করে Run করো।
-- বেশিরভাগ স্টেটমেন্ট idempotent (if not exists) — আগে চালিয়ে থাকলে আবার চালালে নিরাপদ।
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) exams (অ্যাডমিন উইজার্ড / API)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2) exams — optional negative marking column
-- -----------------------------------------------------------------------------
-- Optional per-wrong negative mark (candidate dashboard display). Null = none.

alter table public.exams
  add column if not exists negative_mark_per_wrong numeric;

-- -----------------------------------------------------------------------------
-- 3) exam_candidates (ক্যান্ডিডেট লিস্ট + সাবমিট রেজাল্ট)
-- -----------------------------------------------------------------------------
-- Candidates linked to exams (admin "View candidates" list). Access via service role from Next.js API / server.

create table if not exists public.exam_candidates (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  full_name text,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  score_percent integer
    check (score_percent is null or (score_percent >= 0 and score_percent <= 100)),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists exam_candidates_exam_email_uniq
  on public.exam_candidates (exam_id, lower(trim(email)));

create index if not exists exam_candidates_exam_id_idx
  on public.exam_candidates (exam_id);

alter table public.exam_candidates enable row level security;

-- -----------------------------------------------------------------------------
-- 4) exam_candidates — বিস্তারিত স্কোর (Right / Wrong / Points)
-- -----------------------------------------------------------------------------
-- POST /api/exams/[id]/submit এই কলামগুলো পূরণ করে।

alter table public.exam_candidates
  add column if not exists correct_count integer
    check (correct_count is null or correct_count >= 0);

alter table public.exam_candidates
  add column if not exists wrong_count integer
    check (wrong_count is null or wrong_count >= 0);

alter table public.exam_candidates
  add column if not exists skipped_count integer
    check (skipped_count is null or skipped_count >= 0);

alter table public.exam_candidates
  add column if not exists total_points numeric(12, 2)
    check (total_points is null or total_points >= 0);

alter table public.exam_candidates
  add column if not exists max_points numeric(12, 2)
    check (max_points is null or max_points >= 0);
