import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createServerClientUntyped } from '@/lib/supabase/server'
import {
  getClientDetail,
  getClientAttendance,
  getClientPaymentStatus,
  getClientWorkouts,
} from '@/actions/clients'
import { ClientDetailView } from './client-detail-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const [client, attendance, payment, workouts] = await Promise.all([
    getClientDetail(id),
    getClientAttendance(id),
    getClientPaymentStatus(id),
    getClientWorkouts(id),
  ])

  if (!client) notFound()

  // Fetch tier amount for pre-filling payment drawer
  let tierAmount: number | null = null
  if (client.tier_id) {
    const sb = await createServerClientUntyped()
    const { data: tier } = await sb.from('tiers').select('amount').eq('id', client.tier_id).single()
    if (tier) tierAmount = (tier as { amount: number }).amount
  }

  return (
    <>
      <ClientDetailView
        client={client}
        attendance={attendance}
        payment={payment}
        workouts={workouts}
        tierAmount={tierAmount}
      />
      <BottomNav />
    </>
  )
}
