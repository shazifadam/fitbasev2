'use server'

import { createServerClientUntyped, getTrainerId } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExerciseRow = {
  id: string
  name: string
  body_part: string | null
  target: string | null
  equipment: string | null
  instructions: string[] | null
  is_custom: boolean
}

export type CreateExerciseInput = {
  name: string
  body_part: string
  equipment: string
  instructions: string[] | null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getExercises(): Promise<ExerciseRow[]> {
  const trainerId = await getTrainerId()
  if (!trainerId) return []

  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('exercises')
    .select('id, name, body_part, target, equipment, instructions, is_custom')
    .eq('trainer_id', trainerId)
    .order('name', { ascending: true })

  if (error) {
    console.error('getExercises error:', error)
    return []
  }

  return (data ?? []) as ExerciseRow[]
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createExercise(
  input: CreateExerciseInput
): Promise<{ id?: string; error?: string }> {
  const trainerId = await getTrainerId()
  if (!trainerId) return { error: 'Not authenticated' }

  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: input.name,
      body_part: input.body_part,
      equipment: input.equipment,
      instructions: input.instructions,
      trainer_id: trainerId,
      is_custom: true,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/exercises')
  return { id: (data as { id: string }).id }
}

export async function updateExercise(
  exerciseId: string,
  input: Partial<CreateExerciseInput>
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('exercises')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.body_part !== undefined && { body_part: input.body_part }),
      ...(input.equipment !== undefined && { equipment: input.equipment }),
      ...(input.instructions !== undefined && { instructions: input.instructions }),
    })
    .eq('id', exerciseId)

  if (error) return { error: error.message }
  revalidatePath('/exercises')
  return {}
}

export async function deleteExercise(
  exerciseId: string
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) return { error: error.message }
  revalidatePath('/exercises')
  return {}
}
