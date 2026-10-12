create table if not exists public.story_panels (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  page_id uuid not null references public.story_pages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  panel_number integer not null check (panel_number between 1 and 6),
  layout text not null default 'standard' check (layout in ('standard','wide','close','detail')),
  text text not null default '',
  image_prompt text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id, panel_number)
);
create index if not exists story_panels_story_idx on public.story_panels(story_id, page_id, panel_number);
alter table public.story_panels enable row level security;
create policy "own story panels" on public.story_panels for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public story panels are readable" on public.story_panels for select to anon, authenticated using (exists (select 1 from public.stories s where s.id = story_panels.story_id and s.visibility = 'public'));
