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

-- Example (replace exam id):
-- insert into public.exam_candidates (exam_id, email, full_name, status, score_percent)
-- values ('00000000-0000-0000-0000-000000000000', 'candidate@example.com', 'Ada Candidate', 'in_progress', null);
