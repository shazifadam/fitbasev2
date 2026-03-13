-- Training programs (tags like Strength, Body-Trans, Cardio, HIIT)
create table if not exists training_programs (
  id         uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  unique(trainer_id, name)
);

alter table training_programs enable row level security;

create policy "Trainers manage own programs"
  on training_programs for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());
