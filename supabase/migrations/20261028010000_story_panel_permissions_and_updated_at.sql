-- The initial story_panels migration created row-level policies but did not
-- explicitly grant the table privileges required by PostgREST clients.
grant select on table public.story_panels to anon;
grant select, insert, update, delete on table public.story_panels to authenticated;
grant all on table public.story_panels to service_role;

-- Keep modification timestamps correct when a panel is regenerated/upserted.
drop trigger if exists story_panels_set_updated_at on public.story_panels;
create trigger story_panels_set_updated_at
before update on public.story_panels
for each row execute function public.set_updated_at();
