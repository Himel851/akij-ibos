-- Speed up "my attempts" profile queries filtered by user_id.
create index if not exists exam_attempts_user_id_created_at_idx
  on public.exam_attempts (user_id, created_at desc);
