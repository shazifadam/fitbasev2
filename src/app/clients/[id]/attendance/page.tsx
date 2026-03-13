import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getClientDetail, getClientAttendanceRange } from '@/actions/clients'
import { AttendanceDetailView } from './attendance-detail-view'

export default async function AttendanceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params
  const sp = await searchParams

  // Default to current month
  const now = new Date()
  const monthStr = sp.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = monthStr.split('-').map(Number)

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [client, attendance] = await Promise.all([
    getClientDetail(id),
    getClientAttendanceRange(id, from, to),
  ])

  if (!client) notFound()

  return (
    <AttendanceDetailView
      client={client}
      attendance={attendance}
      year={year}
      month={month}
    />
  )
}
