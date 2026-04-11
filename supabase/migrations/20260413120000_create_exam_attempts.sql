-- One row per exam submit (history). exam_candidates stays one row per (exam, email) = latest snapshot.

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  full_name text,
  score_percent integer
    check (score_percent is null or (score_percent >= 0 and score_percent <= 100)),
  correct_count integer not null default 0
    check (correct_count >= 0),
  wrong_count integer not null default 0
    check (wrong_count >= 0),
  skipped_count integer not null default 0
    check (skipped_count >= 0),
  total_points numeric(12, 2) not null default 0
    check (total_points >= 0),
  max_points numeric(12, 2) not null default 0
    check (max_points >= 0),
  created_at timestamptz not null default now()
);

create index if not exists exam_attempts_exam_id_idx
  on public.exam_attempts (exam_id);

create index if not exists exam_attempts_exam_email_idx
  on public.exam_attempts (exam_id, lower(trim(email)));

create index if not exists exam_attempts_created_at_idx
  on public.exam_attempts (created_at desc);

alter table public.exam_attempts enable row level security;
