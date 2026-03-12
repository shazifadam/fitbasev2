import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getClientDetail, getClientAttendance } from '@/actions/clients'
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

  const [client, attendance] = await Promise.all([
    getClientDetail(id),
    getClientAttendance(id),
  ])

  if (!client) notFound()

  return (
    <>
      <ClientDetailView client={client} attendance={attendance} />
      <BottomNav />
    </>
  )
}
