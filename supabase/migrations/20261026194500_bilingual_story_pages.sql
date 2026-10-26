alter table public.story_pages
  add column if not exists translation_text text,
  add column if not exists translation_language text;

comment on column public.story_pages.translation_text is 'Optional creator-reviewed translation displayed beside the original page text.';
comment on column public.story_pages.translation_language is 'Language label for translation_text.';
