create table public.profiles (
  id uuid primary key,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  provider text not null default 'elevenlabs',
  provider_voice_id text not null,
  sample_url text,
  consent_confirmed boolean not null default false,
  consent_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.voice_profiles to authenticated;
grant all on public.voice_profiles to service_role;
alter table public.voice_profiles enable row level security;
create policy "own voice profiles" on public.voice_profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  kind text not null default 'Child',
  age text,
  personality text,
  appearance text,
  outfit text,
  palette text,
  art_style text not null default 'Soft watercolor',
  portrait_url text,
  reference_url text,
  face_shape text,
  body_shape text,
  hair_style text,
  expression text,
  silhouette text,
  voice_profile_id uuid references public.voice_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.characters to authenticated;
grant all on public.characters to service_role;
alter table public.characters enable row level security;
create policy "own characters" on public.characters for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null default 'Untitled story',
  idea text,
  age_range text not null default '4-6',
  theme text,
  tone text,
  art_style text not null default 'Soft watercolor',
  voice text not null default 'Wren',
  voice_profile_id uuid references public.voice_profiles(id) on delete set null,
  character_ids uuid[] not null default '{}',
  cover_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.stories to authenticated;
grant all on public.stories to service_role;
alter table public.stories enable row level security;
create policy "own stories" on public.stories for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  page_number int not null,
  text text not null default '',
  image_prompt text,
  image_url text,
  audio_url text,
  shot_type text not null default 'Medium',
  camera_motion text not null default 'Slow push-in',
  duration_seconds int not null default 6,
  motion_status text not null default 'not_started',
  motion_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.story_pages to authenticated;
grant all on public.story_pages to service_role;
alter table public.story_pages enable row level security;
create policy "own pages" on public.story_pages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index story_pages_story_page_idx on public.story_pages(story_id, page_number);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger voice_profiles_updated_at before update on public.voice_profiles for each row execute function public.set_updated_at();
create trigger characters_updated_at before update on public.characters for each row execute function public.set_updated_at();
create trigger stories_updated_at before update on public.stories for each row execute function public.set_updated_at();
create trigger story_pages_updated_at before update on public.story_pages for each row execute function public.set_updated_at();

create policy "media own read" on storage.objects for select to authenticated using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media own upload" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media own update" on storage.objects for update to authenticated using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media own delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);