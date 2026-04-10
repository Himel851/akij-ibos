-- Optional per-wrong negative mark (candidate dashboard display). Null = none.

alter table public.exams
  add column if not exists negative_mark_per_wrong numeric;
