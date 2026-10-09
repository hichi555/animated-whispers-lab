create table if not exists public.story_page_versions (
  id uuid primary key default gen_random_uuid(),
  story_page_id uuid not null references public.story_pages(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  version_number integer not null,
  text text not null default '',
  image_prompt text,
  image_url text,
  audio_url text,
  shot_type text not null default 'Medium',
  camera_motion text not null default 'Slow push-in',
  duration_seconds integer not null default 6,
  motion_prompt text,
  motion_status text not null default 'not_started',
  motion_url text,
  created_at timestamptz not null default now(),
  unique (story_page_id, version_number)
);

grant select, insert, update, delete on public.story_page_versions to authenticated;
grant all on public.story_page_versions to service_role;
alter table public.story_page_versions enable row level security;

create policy "own story page versions" on public.story_page_versions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists story_page_versions_page_created_idx
  on public.story_page_versions(story_page_id, created_at desc);

create index if not exists story_page_versions_story_idx
  on public.story_page_versions(story_id, created_at desc);
