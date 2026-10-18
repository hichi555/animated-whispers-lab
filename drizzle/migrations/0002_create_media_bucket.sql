-- CyliaTales media is private and user-scoped.
-- The policies in 0000 protect paths shaped as <auth.uid()>/....
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do update set public = excluded.public;
