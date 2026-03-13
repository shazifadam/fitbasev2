import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import {
  getClientDetail,
  getClientAttendance,
  getClientPaymentStatus,
  getClientWorkouts,
} from '@/actions/clients'
import { getProgressTrend } from '@/actions/progress'
import { ClientDetailView } from './client-detail-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params

  const [client, attendance, payment, workouts, progressTrend] = await Promise.all([
    getClientDetail(id),
    getClientAttendance(id),
    getClientPaymentStatus(id),
    getClientWorkouts(id),
    getProgressTrend(id),
  ])

  if (!client) notFound()

  // Tier amount is now included in the client detail join
  const tierAmount = client.tiers?.amount ?? null

  return (
    <>
      <ClientDetailView
        client={client}
        attendance={attendance}
        payment={payment}
        workouts={workouts}
        tierAmount={tierAmount}
        progressTrend={progressTrend}
      />
      <BottomNav />
    </>
  )
}
