'use server'

import { createServerClientUntyped, getTrainerId } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkoutSummary = {
  id: string
  name: string
  description: string | null
  exerciseCount: number
}

export type WorkoutSetRow = {
  set_number: number
  reps: number
  weight_kg: number
}

export type WorkoutExerciseDetail = {
  id: string
  order_index: number
  sets: WorkoutSetRow[]
  exercise: {
    id: string
    name: string
    body_part: string | null
  }
}

export type WorkoutDetail = {
  id: string
  name: string
  description: string | null
  client_id: string | null
  exercises: WorkoutExerciseDetail[]
}

export type CreateWorkoutExercise = {
  exercise_id: string
  order_index: number
  sets: WorkoutSetRow[]
}

export type CreateWorkoutInput = {
  name: string
  description: string
  client_id: string | null
  exercises: CreateWorkoutExercise[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTrainerWorkouts(): Promise<WorkoutSummary[]> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, description, workout_exercises(count)')
    .order('name', { ascending: true })

  if (error) {
    console.error('getTrainerWorkouts error:', error)
    return []
  }

  return (data ?? []).map((w: Record<string, unknown>) => ({
    id: w.id as string,
    name: w.name as string,
    description: (w.description as string | null) ?? null,
    exerciseCount: Array.isArray(w.workout_exercises)
      ? ((w.workout_exercises as { count: number }[])[0]?.count ?? 0)
      : 0,
  }))
}

export async function getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('workouts')
    .select(`
      id, name, description, client_id,
      workout_exercises(
        id, order_index, sets,
        exercises(id, name, body_part)
      )
    `)
    .eq('id', workoutId)
    .single()

  if (error || !data) return null

  const raw = data as unknown as {
    id: string
    name: string
    description: string | null
    client_id: string | null
    workout_exercises: {
      id: string
      order_index: number
      sets: WorkoutSetRow[] | null
      exercises: { id: string; name: string; body_part: string | null }
    }[]
  }

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    client_id: raw.client_id,
    exercises: (raw.workout_exercises ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(we => ({
        id: we.id,
        order_index: we.order_index,
        sets: (we.sets ?? []) as WorkoutSetRow[],
        exercise: we.exercises,
      })),
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createWorkout(
  input: CreateWorkoutInput
): Promise<{ id?: string; error?: string }> {
  const trainerId = await getTrainerId()
  if (!trainerId) return { error: 'Not authenticated' }

  const supabase = await createServerClientUntyped()

  const { data: workout, error: wErr } = await supabase
    .from('workouts')
    .insert({
      name: input.name,
      description: input.description || null,
      client_id: input.client_id,
      trainer_id: trainerId,
    })
    .select('id')
    .single()

  if (wErr || !workout) return { error: wErr?.message ?? 'Failed to create workout' }

  const workoutId = (workout as { id: string }).id

  if (input.exercises.length > 0) {
    const rows = input.exercises.map(e => ({
      workout_id: workoutId,
      exercise_id: e.exercise_id,
      order_index: e.order_index,
      sets: e.sets,
    }))
    const { error: eErr } = await supabase.from('workout_exercises').insert(rows)
    if (eErr) return { error: eErr.message }
  }

  revalidatePath('/workouts')
  return { id: workoutId }
}

export async function updateWorkout(
  workoutId: string,
  input: CreateWorkoutInput
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error: wErr } = await supabase
    .from('workouts')
    .update({
      name: input.name,
      description: input.description || null,
      client_id: input.client_id,
    })
    .eq('id', workoutId)

  if (wErr) return { error: wErr.message }

  // Delete old exercises and re-insert
  await supabase.from('workout_exercises').delete().eq('workout_id', workoutId)

  if (input.exercises.length > 0) {
    const rows = input.exercises.map(e => ({
      workout_id: workoutId,
      exercise_id: e.exercise_id,
      order_index: e.order_index,
      sets: e.sets,
    }))
    const { error: eErr } = await supabase.from('workout_exercises').insert(rows)
    if (eErr) return { error: eErr.message }
  }

  revalidatePath('/workouts')
  revalidatePath(`/workouts/${workoutId}`)
  return {}
}

export async function deleteWorkout(
  workoutId: string
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  await supabase.from('workout_exercises').delete().eq('workout_id', workoutId)
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId)

  if (error) return { error: error.message }
  revalidatePath('/workouts')
  return {}
}
