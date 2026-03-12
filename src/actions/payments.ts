'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentRow = {
  id: string
  client_id: string
  tier_id: string | null
  amount: number
  currency: string
  payment_date: string
  valid_until: string
  created_at: string
}

export type PaymentHistoryData = {
  client: {
    id: string
    name: string
    tier_name: string | null
    tier_amount: number | null
  }
  payments: PaymentRow[]
  summary: {
    totalPaid: number
    pending: number
    monthCount: number
    currency: string
  }
}

export type RecordPaymentInput = {
  client_id: string
  amount: number
  currency: string
  for_month: string        // YYYY-MM format
  payment_method: string
  notes: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPaymentHistory(clientId: string): Promise<PaymentHistoryData | null> {
  const supabase = await createServerClientUntyped()

  // Fetch client with tier info
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, tier_id, tiers(name, amount)')
    .eq('id', clientId)
    .single()

  if (!client) return null

  const c = client as unknown as {
    id: string
    name: string
    tier_id: string | null
    tiers: { name: string; amount: number } | null
  }

  // Fetch all payments ordered by date desc
  const { data: payments } = await supabase
    .from('payments')
    .select('id, client_id, tier_id, amount, currency, payment_date, valid_until, created_at')
    .eq('client_id', clientId)
    .order('payment_date', { ascending: false })

  const rows = (payments ?? []) as PaymentRow[]

  const totalPaid = rows.reduce((sum, p) => sum + Number(p.amount), 0)
  const currency = rows[0]?.currency ?? 'OMR'

  // Calculate pending: tier amount if latest payment is overdue or no payments exist
  const tierAmount = c.tiers?.amount ?? 0
  let pending = 0
  if (rows.length === 0) {
    pending = tierAmount
  } else {
    const today = new Date().toISOString().split('T')[0]
    if (rows[0].valid_until < today) {
      pending = tierAmount
    }
  }

  return {
    client: {
      id: c.id,
      name: c.name,
      tier_name: c.tiers?.name ?? null,
      tier_amount: c.tiers?.amount ?? null,
    },
    payments: rows,
    summary: {
      totalPaid,
      pending,
      monthCount: rows.length,
      currency,
    },
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function recordPayment(input: RecordPaymentInput): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return { error: 'Trainer not found' }

  const trainerId = (trainer as { id: string }).id

  // Get client's tier_id
  const { data: client } = await supabase
    .from('clients')
    .select('tier_id')
    .eq('id', input.client_id)
    .single()

  // payment_date = today (submission date), valid_until = +1 month from today
  const today = new Date()
  const paymentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const validUntilDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const validUntil = `${validUntilDate.getFullYear()}-${String(validUntilDate.getMonth() + 1).padStart(2, '0')}-${String(validUntilDate.getDate()).padStart(2, '0')}`

  const { error } = await supabase
    .from('payments')
    .insert({
      client_id: input.client_id,
      trainer_id: trainerId,
      tier_id: (client as { tier_id: string | null } | null)?.tier_id ?? null,
      amount: input.amount,
      currency: input.currency,
      payment_date: paymentDate,
      valid_until: validUntil,
    })

  if (error) return { error: error.message }

  revalidatePath(`/clients/${input.client_id}`)
  revalidatePath(`/clients/${input.client_id}/payments`)
  revalidatePath('/dashboard')
  return {}
}

export async function deletePayment(paymentId: string, clientId: string): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/payments`)
  return {}
}
