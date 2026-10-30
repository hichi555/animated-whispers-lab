alter table public.story_pages
  add column if not exists narration_script text,
  add column if not exists narration_voice text;

comment on column public.story_pages.narration_script is
  'Optional director-edited narration text; NULL means narrate the page text.';
comment on column public.story_pages.narration_voice is
  'Optional narrator identifier used to render this page audio.';
