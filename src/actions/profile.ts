'use server'

import { createServerClientUntyped, getTrainerId } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrainerProfileDetail = {
  id: string
  display_name: string
  email: string
  photo_url: string | null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTrainerProfileDetail(): Promise<TrainerProfileDetail | null> {
  const trainerId = await getTrainerId()
  if (!trainerId) return null

  const supabase = await createServerClientUntyped()

  const { data } = await supabase
    .from('users')
    .select('id, display_name, email, photo_url')
    .eq('id', trainerId)
    .single()

  return data as TrainerProfileDetail | null
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function updateTrainerProfile(input: {
  display_name: string
}): Promise<{ error?: string }> {
  const trainerId = await getTrainerId()
  if (!trainerId) return { error: 'Not authenticated' }

  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('users')
    .update({ display_name: input.display_name.trim() })
    .eq('id', trainerId)

  if (error) return { error: error.message }

  revalidatePath('/more')
  revalidatePath('/dashboard')
  return {}
}

export async function signOut(): Promise<void> {
  const supabase = await createServerClientUntyped()
  await supabase.auth.signOut()
}
