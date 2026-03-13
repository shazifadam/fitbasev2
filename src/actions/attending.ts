'use server'

import { createServerClientUntyped, getTrainerId } from '@/lib/supabase/server'
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
  const trainerId = await getTrainerId()
  if (!trainerId) return []

  const supabase = await createServerClientUntyped()
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
    .eq('trainer_id', trainerId)
    .eq('scheduled_date', today)
    .order('session_started_at', { ascending: true })

  if (error) {
    console.error('getAttendingSessions error:', error)
    return []
  }

  return (data ?? []) as unknown as AttendingSession[]
}

/**
 * Fetch the last attended session's exercise_weights for a client.
 * If a workoutId is given, tries to match that workout first.
 */
export async function getPreviousSessionWeights(
  clientId: string,
  workoutId: string | null,
): Promise<ExerciseWeights | null> {
  const supabase = await createServerClientUntyped()

  // Try matching same workout first
  if (workoutId) {
    const { data } = await supabase
      .from('attendance')
      .select('exercise_weights')
      .eq('client_id', clientId)
      .eq('session_workout_id', workoutId)
      .eq('status', 'attended')
      .not('exercise_weights', 'is', null)
      .order('scheduled_date', { ascending: false })
      .limit(1)
      .single()

    if (data?.exercise_weights) {
      return data.exercise_weights as unknown as ExerciseWeights
    }
  }

  // Fallback: any last attended session with weights
  const { data } = await supabase
    .from('attendance')
    .select('exercise_weights')
    .eq('client_id', clientId)
    .eq('status', 'attended')
    .not('exercise_weights', 'is', null)
    .order('scheduled_date', { ascending: false })
    .limit(1)
    .single()

  if (data?.exercise_weights) {
    return data.exercise_weights as unknown as ExerciseWeights
  }

  return null
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
