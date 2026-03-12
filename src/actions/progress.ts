'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressRow = {
  id: string
  client_id: string
  weight: number | null
  height: number | null
  fat_percent: number | null
  waist: number | null
  recorded_at: string
}

export type ProgressHistoryData = {
  client: {
    id: string
    name: string
    training_programs: string[] | null
  }
  entries: ProgressRow[]
}

export type RecordProgressInput = {
  client_id: string
  weight: number | null
  height: number | null
  fat_percent: number | null
  notes: string
  recorded_at: string // YYYY-MM-DD
}

export type PreviousMeasurement = {
  weight: number | null
  height: number | null
  fat_percent: number | null
  recorded_at: string
} | null

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProgressHistory(clientId: string): Promise<ProgressHistoryData | null> {
  const supabase = await createServerClientUntyped()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, training_programs')
    .eq('id', clientId)
    .single()

  if (!client) return null

  const c = client as { id: string; name: string; training_programs: string[] | null }

  const { data: entries } = await supabase
    .from('progress')
    .select('id, client_id, weight, height, fat_percent, waist, recorded_at')
    .eq('client_id', clientId)
    .order('recorded_at', { ascending: false })

  return {
    client: { id: c.id, name: c.name, training_programs: c.training_programs },
    entries: (entries ?? []) as ProgressRow[],
  }
}

export async function getPreviousMeasurement(clientId: string): Promise<PreviousMeasurement> {
  const supabase = await createServerClientUntyped()

  const { data } = await supabase
    .from('progress')
    .select('weight, height, fat_percent, recorded_at')
    .eq('client_id', clientId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null
  return data as PreviousMeasurement
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function recordProgress(input: RecordProgressInput): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return { error: 'Trainer not found' }

  const trainerId = (trainer as { id: string }).id

  const { error } = await supabase
    .from('progress')
    .insert({
      client_id: input.client_id,
      trainer_id: trainerId,
      weight: input.weight,
      height: input.height,
      fat_percent: input.fat_percent,
      recorded_at: input.recorded_at,
    })

  if (error) return { error: error.message }

  // Update current_ fields on client
  const updates: Record<string, number | null> = {}
  if (input.weight != null) updates.current_weight = input.weight
  if (input.height != null) updates.current_height = input.height
  if (input.fat_percent != null) updates.current_fat_percent = input.fat_percent

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('clients')
      .update(updates)
      .eq('id', input.client_id)
  }

  revalidatePath(`/clients/${input.client_id}`)
  revalidatePath(`/clients/${input.client_id}/progress`)
  revalidatePath('/dashboard')
  return {}
}

export async function deleteProgress(progressId: string, clientId: string): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('id', progressId)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/progress`)
  return {}
}
