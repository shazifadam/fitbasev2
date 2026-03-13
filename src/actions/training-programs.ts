'use server'

import { createServerClientUntyped, getTrainerId } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrainingProgram = {
  id: string
  name: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  const trainerId = await getTrainerId()
  if (!trainerId) return []

  const supabase = await createServerClientUntyped()

  const { data: existing } = await supabase
    .from('training_programs')
    .select('id, name')
    .eq('trainer_id', trainerId)
    .order('name', { ascending: true })

  if (existing && existing.length > 0) return existing as TrainingProgram[]

  // Auto-seed defaults on first access
  const defaults = [
    { name: 'Strength', trainer_id: trainerId },
    { name: 'Body-Trans', trainer_id: trainerId },
    { name: 'Cardio', trainer_id: trainerId },
    { name: 'HIIT', trainer_id: trainerId },
  ]
  const { data: seeded } = await supabase
    .from('training_programs')
    .insert(defaults)
    .select('id, name')

  return (seeded ?? []) as TrainingProgram[]
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createTrainingProgram(name: string): Promise<{ error?: string }> {
  const trainerId = await getTrainerId()
  if (!trainerId) return { error: 'Not authenticated' }

  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('training_programs')
    .insert({ trainer_id: trainerId, name: name.trim() })

  if (error) return { error: error.message }

  revalidatePath('/more/programs')
  return {}
}

export async function updateTrainingProgram(id: string, name: string): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('training_programs')
    .update({ name: name.trim() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/more/programs')
  return {}
}

export async function deleteTrainingProgram(id: string): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('training_programs')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/more/programs')
  return {}
}
