-- Detailed result stats when a candidate completes an attempt (filled by POST /api/exams/[id]/submit).

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
