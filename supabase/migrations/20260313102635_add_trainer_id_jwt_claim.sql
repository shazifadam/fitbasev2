-- Custom Access Token Hook: injects trainer_id (users.id) into JWT claims
-- This eliminates a DB round-trip on every authenticated request.
--
-- IMPORTANT: After running this migration, enable the hook in Supabase Dashboard:
--   Auth > Hooks > Custom Access Token > Enable
--   Schema: public, Function: custom_access_token_hook

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  trainer_id uuid;
begin
  claims := event->'claims';

  -- Look up the trainer's internal UUID from the auth user ID
  select id into trainer_id
    from public.users
    where auth_id = (event->>'user_id')::uuid;

  if trainer_id is not null then
    claims := jsonb_set(claims, '{trainer_id}', to_jsonb(trainer_id::text));
  else
    claims := jsonb_set(claims, '{trainer_id}', 'null'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Grant execute to supabase_auth_admin (required for auth hooks)
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

-- Revoke from public for security
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- Grant read access on users table to the auth admin role
grant select on table public.users to supabase_auth_admin;
