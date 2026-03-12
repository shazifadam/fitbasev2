'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
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
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id, display_name, email, photo_url')
    .eq('auth_id', user.id)
    .single()

  return data as TrainerProfileDetail | null
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function updateTrainerProfile(input: {
  display_name: string
}): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({ display_name: input.display_name.trim() })
    .eq('auth_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/more')
  revalidatePath('/dashboard')
  return {}
}

export async function signOut(): Promise<void> {
  const supabase = await createServerClientUntyped()
  await supabase.auth.signOut()
}
