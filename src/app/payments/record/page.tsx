import { redirect } from 'next/navigation'
import { getSessionUser, createServerClientUntyped } from '@/lib/supabase/server'
import { RecordPaymentSelectClient } from './record-payment-select-client'

export default async function RecordPaymentPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const sb = await createServerClientUntyped()
  const { data: trainer } = await sb.from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) redirect('/login')

  const trainerId = (trainer as { id: string }).id

  const { data: clients } = await sb
    .from('clients')
    .select('id, name, tier_id, tiers(name, amount)')
    .eq('trainer_id', trainerId)
    .eq('is_archived', false)
    .order('name', { ascending: true })

  const clientList = ((clients ?? []) as unknown as {
    id: string
    name: string
    tier_id: string | null
    tiers: { name: string; amount: number } | null
  }[]).map(c => ({
    id: c.id,
    name: c.name,
    tierName: c.tiers?.name ?? null,
    tierAmount: c.tiers?.amount ?? null,
  }))

  return <RecordPaymentSelectClient clients={clientList} />
}
