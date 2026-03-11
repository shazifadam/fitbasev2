'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  schedule_set: string
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

  const { data } = await supabase
    .from('tiers')
    .select('id, name')
    .order('name', { ascending: true })

  return (data ?? []) as TierRow[]
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createClient(input: CreateClientInput) {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) throw new Error('Trainer not found')

  const { error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      phone: input.phone,
      training_programs: input.training_programs,
      tier_id: input.tier_id || null,
      schedule_set: input.schedule_set,
      session_times: input.session_times,
      trainer_id: (trainer as { id: string }).id,
    })

  if (error) throw error

  revalidatePath('/clients')
  redirect('/clients')
}
