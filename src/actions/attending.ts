'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SetEntry = {
  set_number: number
  weight_kg: number | null
  reps: number | null
  completed: boolean
}

export type ExerciseEntry = {
  exercise_id: string
  exercise_name: string
  sets: SetEntry[]
}

export type ExerciseWeights = {
  exercises: ExerciseEntry[]
}

export type WorkoutExercise = {
  order_index: number
  sets: SetEntry[]
  exercises: { id: string; name: string } | null
}

export type AttendingSession = {
  id: string
  client_id: string
  session_started_at: string | null
  session_workout_id: string | null
  exercise_weights: ExerciseWeights | null
  clients: {
    name: string
    training_programs: string[] | null
  } | null
  workouts: {
    id: string
    name: string
    workout_exercises: WorkoutExercise[]
  } | null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAttendingSessions(): Promise<AttendingSession[]> {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id,
      client_id,
      session_started_at,
      session_workout_id,
      exercise_weights,
      clients(name, training_programs),
      workouts:session_workout_id(
        id,
        name,
        workout_exercises(
          order_index,
          sets,
          exercises(id, name)
        )
      )
    `)
    .eq('status', 'attending')
    .eq('trainer_id', (trainer as { id: string }).id)
    .eq('scheduled_date', today)
    .order('session_started_at', { ascending: true })

  if (error) {
    console.error('getAttendingSessions error:', error)
    return []
  }

  return (data ?? []) as unknown as AttendingSession[]
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function completeSession(
  attendanceId: string,
  exerciseWeights: ExerciseWeights,
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('attendance')
    .update({
      status: 'attended',
      session_ended_at: new Date().toISOString(),
      exercise_weights: exerciseWeights,
    })
    .eq('id', attendanceId)

  if (error) return { error: error.message }

  revalidatePath('/attending')
  revalidatePath('/dashboard')
  return {}
}
