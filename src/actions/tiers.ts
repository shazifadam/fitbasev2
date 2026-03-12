'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TierDetail = {
  id: string
  name: string
  amount: number
  color: string
  max_concurrent_clients: number
  is_default: boolean
}

export type CreateTierInput = {
  name: string
  amount: number
}

export type UpdateTierInput = {
  name: string
  amount: number
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTiers(): Promise<TierDetail[]> {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return []

  const trainerId = (trainer as { id: string }).id

  const { data } = await supabase
    .from('tiers')
    .select('id, name, amount, color, max_concurrent_clients, is_default')
    .eq('trainer_id', trainerId)
    .order('amount', { ascending: true })

  return (data ?? []) as TierDetail[]
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createTier(input: CreateTierInput): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return { error: 'Trainer not found' }

  const trainerId = (trainer as { id: string }).id

  const { error } = await supabase
    .from('tiers')
    .insert({
      trainer_id: trainerId,
      name: input.name.trim(),
      amount: input.amount,
      color: '#262626',
      max_concurrent_clients: 50,
    })

  if (error) return { error: error.message }

  revalidatePath('/more/tiers')
  return {}
}

export async function updateTier(tierId: string, input: UpdateTierInput): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('tiers')
    .update({ name: input.name.trim(), amount: input.amount })
    .eq('id', tierId)

  if (error) return { error: error.message }

  revalidatePath('/more/tiers')
  return {}
}

export async function deleteTier(tierId: string): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('tiers')
    .delete()
    .eq('id', tierId)

  if (error) return { error: error.message }

  revalidatePath('/more/tiers')
  return {}
}
