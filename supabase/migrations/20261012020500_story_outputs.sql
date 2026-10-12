create table if not exists public.story_outputs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('poster')),
  status text not null default 'complete' check (status in ('processing','complete','failed')),
  title text not null,
  prompt text not null,
  asset_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_outputs_story_idx on public.story_outputs(story_id, created_at desc);

alter table public.story_outputs enable row level security;

create policy "own story outputs" on public.story_outputs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
