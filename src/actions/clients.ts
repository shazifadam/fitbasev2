'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientRow = {
  id: string
  name: string
  training_programs: string[] | null
  schedule_set: string
  tier_id: string | null
}

export type TierRow = {
  id: string
  name: string
}

export type CreateClientInput = {
  name: string
  phone: string
  training_programs: string[]
  tier_id: string | null
  schedule_set: 'sunday' | 'saturday' | 'custom'
  custom_days: string[]
  session_times: Record<string, string>
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<ClientRow[]> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, training_programs, schedule_set, tier_id')
    .eq('is_archived', false)
    .order('name', { ascending: true })

  if (error) {
    console.error('getClients error:', error)
    return []
  }

  return (data ?? []) as ClientRow[]
}

export async function getTiers(): Promise<TierRow[]> {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return []

  const trainerId = (trainer as { id: string }).id

  const { data: existing } = await supabase
    .from('tiers')
    .select('id, name')
    .eq('trainer_id', trainerId)
    .order('name', { ascending: true })

  if (existing && existing.length > 0) return existing as TierRow[]

  // TODO: remove auto-seed once tier management page is built
  const defaults = [
    { name: 'Basic',    color: '#262626', amount: 0, max_concurrent_clients: 10, trainer_id: trainerId, is_default: true },
    { name: 'Standard', color: '#262626', amount: 0, max_concurrent_clients: 20, trainer_id: trainerId, is_default: false },
    { name: 'Premium',  color: '#262626', amount: 0, max_concurrent_clients: 30, trainer_id: trainerId, is_default: false },
  ]
  const { data: seeded } = await supabase.from('tiers').insert(defaults).select('id, name')
  return (seeded ?? []) as TierRow[]
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createClient(
  input: CreateClientInput
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer profile not found. Please sign out and sign in again.' }

  const { error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      phone: input.phone,
      training_programs: input.training_programs,
      tier_id: input.tier_id || null,
      schedule_set: input.schedule_set,
      custom_days: input.custom_days,
      session_times: input.session_times,
      trainer_id: (trainer as { id: string }).id,
    })

  if (error) return { error: error.message }

  revalidatePath('/clients')
  return {}
}
