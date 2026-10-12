alter table public.stories add column if not exists source_story_id uuid references public.stories(id) on delete set null;
alter table public.stories add column if not exists branch_type text not null default 'original' check (branch_type in ('original','remix','continuation'));
create index if not exists stories_source_story_idx on public.stories(source_story_id);
