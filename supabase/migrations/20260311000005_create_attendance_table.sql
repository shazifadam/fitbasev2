-- Create attendance table (v2 — includes full session flow columns)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,

  -- Status pipeline: scheduled → attending → attended | missed | rescheduled
  status TEXT CHECK (
    status IN ('scheduled', 'attending', 'attended', 'missed', 'rescheduled')
  ) DEFAULT 'scheduled',

  -- Session tracking (populated when status → 'attending')
  session_started_at TIMESTAMPTZ,
  session_ended_at TIMESTAMPTZ,

  -- Optional workout linked at session start (null if trainer skipped selection)
  session_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,

  -- Weight data recorded during session
  -- Structure: { "exercises": [{ "exercise_id": "uuid", "exercise_name": "...",
  --   "sets": [{ "set_number": 1, "weight_kg": 60, "reps": 10, "completed": true }] }] }
  exercise_weights JSONB DEFAULT '{}',

  -- Rescheduling fields
  rescheduled_to TIMESTAMPTZ,
  rescheduled_from TIMESTAMPTZ,
  reschedule_reason TEXT,
  is_makeup_session BOOLEAN DEFAULT FALSE,
  original_session_id UUID REFERENCES attendance(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_client_id ON attendance(client_id);
CREATE INDEX idx_attendance_scheduled_date ON attendance(scheduled_date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_trainer_date ON attendance(trainer_id, scheduled_date);
CREATE INDEX idx_attendance_session_workout ON attendance(session_workout_id);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view own attendance"
  ON attendance FOR SELECT
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can create own attendance"
  ON attendance FOR INSERT
  WITH CHECK (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can update own attendance"
  ON attendance FOR UPDATE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Trainers can delete own attendance"
  ON attendance FOR DELETE
  USING (trainer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
