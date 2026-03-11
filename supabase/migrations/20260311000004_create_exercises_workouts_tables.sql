-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body_part TEXT,
  target TEXT,
  equipment TEXT,
  gif_url TEXT,
  instructions TEXT[],
  secondary_muscles TEXT[],
  is_custom BOOLEAN DEFAULT FALSE,
  exercise_db_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_trainer_id ON exercises(trainer_id);
CREATE INDEX idx_exercises_name ON exercises(name);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own exercises"
  ON exercises FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR trainer_id IS NULL);

CREATE POLICY "Trainers can create own exercises"
  ON exercises FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own exercises"
  ON exercises FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_trainer_id ON workouts(trainer_id);
CREATE INDEX idx_workouts_client_id ON workouts(client_id);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own workouts"
  ON workouts FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create own workouts"
  ON workouts FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own workouts"
  ON workouts FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete own workouts"
  ON workouts FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create workout_exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  -- sets: [{set_number: 1, reps: 10, weight_kg: 60}]
  sets JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage workout exercises"
  ON workout_exercises FOR ALL
  USING (
    workout_id IN (
      SELECT w.id FROM workouts w
      JOIN users u ON w.trainer_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
