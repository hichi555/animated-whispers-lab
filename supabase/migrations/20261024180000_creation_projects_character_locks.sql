create table if not exists public.creation_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid references public.stories(id) on delete set null,
  title text not null,
  brief text not null,
  creation_mode text not null check (creation_mode in ('ebook','audiobook','avatar','anime','media','video','lip_sync')),
  status text not null default 'draft' check (status in ('draft','planning','in_progress','review','complete','archived')),
  age_range text,
  language text not null default 'English',
  style_id text,
  voice_profile_id uuid references public.voice_profiles(id) on delete set null,
  selected_models jsonb not null default '{}'::jsonb,
  safety_status text not null default 'pending' check (safety_status in ('pending','passed','blocked','needs_review')),
  safety_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.character_locks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  name text not null,
  identity_prompt text not null,
  reference_paths text[] not null default '{}',
  negative_prompt text,
  style_id text,
  version integer not null default 1 check (version > 0),
  status text not null default 'draft' check (status in ('draft','approved','needs_review','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creation_project_characters (
  project_id uuid not null references public.creation_projects(id) on delete cascade,
  character_lock_id uuid not null references public.character_locks(id) on delete cascade,
  role text not null default 'cast',
  created_at timestamptz not null default now(),
  primary key (project_id, character_lock_id)
);

create table if not exists public.creation_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.creation_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_artifact_id uuid references public.creation_artifacts(id) on delete set null,
  artifact_type text not null check (artifact_type in ('ebook','ebook_pdf','audiobook','narration_track','avatar','image','video','scene','lip_sync','music','media_reference')),
  status text not null default 'planned' check (status in ('planned','processing','ready','failed','archived')),
  provider text,
  storage_path text,
  duration_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creation_projects_user_updated_idx on public.creation_projects(user_id, updated_at desc);
create index if not exists creation_projects_story_idx on public.creation_projects(story_id, updated_at desc);
create index if not exists character_locks_user_status_idx on public.character_locks(user_id, status, updated_at desc);
create index if not exists creation_artifacts_project_idx on public.creation_artifacts(project_id, created_at desc);
create index if not exists creation_artifacts_parent_idx on public.creation_artifacts(parent_artifact_id);

alter table public.creation_projects enable row level security;
alter table public.character_locks enable row level security;
alter table public.creation_project_characters enable row level security;
alter table public.creation_artifacts enable row level security;

create policy "owners read creation projects" on public.creation_projects for select to authenticated using (auth.uid() = user_id);
create policy "owners create creation projects" on public.creation_projects for insert to authenticated with check (auth.uid() = user_id);
create policy "owners update creation projects" on public.creation_projects for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners delete creation projects" on public.creation_projects for delete to authenticated using (auth.uid() = user_id);

create policy "owners read character locks" on public.character_locks for select to authenticated using (auth.uid() = user_id);
create policy "owners create character locks" on public.character_locks for insert to authenticated with check (auth.uid() = user_id);
create policy "owners update character locks" on public.character_locks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners delete character locks" on public.character_locks for delete to authenticated using (auth.uid() = user_id);

create policy "owners read project characters" on public.creation_project_characters for select to authenticated using (
  exists (select 1 from public.creation_projects p where p.id = project_id and p.user_id = auth.uid())
);
create policy "owners create project characters" on public.creation_project_characters for insert to authenticated with check (
  exists (select 1 from public.creation_projects p where p.id = project_id and p.user_id = auth.uid())
  and exists (select 1 from public.character_locks c where c.id = character_lock_id and c.user_id = auth.uid())
);
create policy "owners delete project characters" on public.creation_project_characters for delete to authenticated using (
  exists (select 1 from public.creation_projects p where p.id = project_id and p.user_id = auth.uid())
);

create policy "owners read creation artifacts" on public.creation_artifacts for select to authenticated using (auth.uid() = user_id);
create policy "owners create creation artifacts" on public.creation_artifacts for insert to authenticated with check (
  auth.uid() = user_id and exists (select 1 from public.creation_projects p where p.id = project_id and p.user_id = auth.uid())
);
create policy "owners update creation artifacts" on public.creation_artifacts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners delete creation artifacts" on public.creation_artifacts for delete to authenticated using (auth.uid() = user_id);

create trigger creation_projects_updated_at before update on public.creation_projects for each row execute function public.set_updated_at();
create trigger character_locks_updated_at before update on public.character_locks for each row execute function public.set_updated_at();
create trigger creation_artifacts_updated_at before update on public.creation_artifacts for each row execute function public.set_updated_at();
