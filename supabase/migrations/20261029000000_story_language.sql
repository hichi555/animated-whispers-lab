alter table public.stories
  add column if not exists language text not null default 'English';
