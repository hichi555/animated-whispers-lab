alter table public.story_pages
  add column if not exists transition_type text not null default 'cut',
  add column if not exists transition_duration_ms integer not null default 280,
  add column if not exists transition_easing text not null default 'ease-in-out',
  add column if not exists pacing text not null default 'cinematic',
  add column if not exists audio_duck_db numeric not null default -5,
  add column if not exists captions_enabled boolean not null default true,
  add column if not exists beat_markers jsonb not null default '[]'::jsonb;

alter table public.story_pages
  drop constraint if exists story_pages_transition_type_check;
alter table public.story_pages
  add constraint story_pages_transition_type_check
  check (transition_type in ('cut','dissolve','fade-black','fade-white','slide-left','slide-right'));

alter table public.story_pages
  drop constraint if exists story_pages_transition_duration_check;
alter table public.story_pages
  add constraint story_pages_transition_duration_check
  check (transition_duration_ms between 0 and 2000);

alter table public.story_pages
  drop constraint if exists story_pages_transition_easing_check;
alter table public.story_pages
  add constraint story_pages_transition_easing_check
  check (transition_easing in ('linear','ease-in','ease-out','ease-in-out','spring'));

alter table public.story_pages
  drop constraint if exists story_pages_pacing_check;
alter table public.story_pages
  add constraint story_pages_pacing_check
  check (pacing in ('slow','cinematic','brisk','dialogue'));

comment on column public.story_pages.transition_type is 'How this scene enters after the prior approved shot.';
comment on column public.story_pages.transition_duration_ms is 'Transition duration in milliseconds for preview and final assembly.';
comment on column public.story_pages.transition_easing is 'Preview/export easing curve for transition and camera motion.';
comment on column public.story_pages.pacing is 'Editorial pacing preset used for narration and timing suggestions.';
comment on column public.story_pages.audio_duck_db is 'Music and ambience ducking while narration is active.';
comment on column public.story_pages.captions_enabled is 'Include this scene in caption export.';
comment on column public.story_pages.beat_markers is 'Optional JSON timing markers for narration, action and caption alignment.';
