-- Update custom_access_token_hook to also inject onboarding_completed into JWT claims.
-- This allows middleware to check onboarding status without a DB call.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  trainer_id uuid;
  onboarding_done boolean;
begin
  claims := event->'claims';

  -- Look up the trainer's internal UUID and onboarding status
  select id, onboarding_completed into trainer_id, onboarding_done
    from public.users
    where auth_id = (event->>'user_id')::uuid;

  if trainer_id is not null then
    claims := jsonb_set(claims, '{trainer_id}', to_jsonb(trainer_id::text));
  else
    claims := jsonb_set(claims, '{trainer_id}', 'null'::jsonb);
  end if;

  claims := jsonb_set(claims, '{onboarding_completed}', to_jsonb(coalesce(onboarding_done, false)));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;
