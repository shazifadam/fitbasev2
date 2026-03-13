-- Fix RLS policy: trainer_id references users.id, not auth.uid() directly
drop policy if exists "Trainers manage own programs" on training_programs;

create policy "Trainers can view own programs"
  on training_programs for select
  using (trainer_id in (select id from users where auth_id = auth.uid()));

create policy "Trainers can create own programs"
  on training_programs for insert
  with check (trainer_id in (select id from users where auth_id = auth.uid()));

create policy "Trainers can update own programs"
  on training_programs for update
  using (trainer_id in (select id from users where auth_id = auth.uid()));

create policy "Trainers can delete own programs"
  on training_programs for delete
  using (trainer_id in (select id from users where auth_id = auth.uid()));
