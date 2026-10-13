create table if not exists public.story_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid references public.stories(id) on delete cascade,
  job_type text not null check (job_type in ('story_plan','illustration','narration','motion','poster','comic')),
  provider text not null default 'local-gateway',
  status text not null default 'queued' check (status in ('queued','processing','completed','failed','cancelled')),
  request_payload jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  error text,
  attempts integer not null default 0 check (attempts >= 0),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists story_generation_jobs_user_idx
  on public.story_generation_jobs(user_id, created_at desc);
create index if not exists story_generation_jobs_story_idx
  on public.story_generation_jobs(story_id, created_at desc);
create index if not exists story_generation_jobs_status_idx
  on public.story_generation_jobs(status, created_at desc);

alter table public.story_generation_jobs enable row level security;

create policy "owners read story generation jobs"
  on public.story_generation_jobs for select to authenticated
  using (auth.uid() = user_id);

create policy "owners create story generation jobs"
  on public.story_generation_jobs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "owners update story generation jobs"
  on public.story_generation_jobs for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
