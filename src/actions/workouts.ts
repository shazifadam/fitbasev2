'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'

export type WorkoutSummary = {
  id: string
  name: string
  description: string | null
  exerciseCount: number
}

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

  return (data ?? []).map(w => ({
    id: w.id,
    name: w.name,
    description: (w as { description?: string | null }).description ?? null,
    exerciseCount: Array.isArray((w as { workout_exercises?: unknown[] }).workout_exercises)
      ? ((w as { workout_exercises: { count: number }[] }).workout_exercises[0]?.count ?? 0)
      : 0,
  }))
}
