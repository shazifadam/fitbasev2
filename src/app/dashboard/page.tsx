import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAttendanceForDate, getTrainerProfile } from '@/actions/dashboard'
import { DashboardView } from './dashboard-view'
import { BottomNav } from '@/components/layout/bottom-nav'

function todayUTC(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const date = params.date ?? todayUTC()

  const [attendance, trainer] = await Promise.all([
    getAttendanceForDate(date),
    getTrainerProfile(),
  ])

  return (
    <>
      <DashboardView
        date={date}
        attendance={attendance}
        trainerName={trainer?.display_name ?? 'Trainer'}
      />
      <BottomNav />
    </>
  )
}
