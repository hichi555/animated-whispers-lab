alter table public.stories add column if not exists visibility text not null default 'private' check (visibility in ('private','public'));
alter table public.stories add column if not exists published_at timestamptz;

create index if not exists stories_public_idx on public.stories(visibility, published_at desc);

create policy "public stories are readable" on public.stories for select to anon, authenticated using (visibility = 'public');
create policy "public story pages are readable" on public.story_pages for select to anon, authenticated using (exists (select 1 from public.stories s where s.id = story_pages.story_id and s.visibility = 'public'));

create policy "owners publish stories" on public.stories for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
