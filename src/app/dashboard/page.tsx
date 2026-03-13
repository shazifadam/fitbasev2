import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
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
  const user = await getSessionUser()
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
        trainerId={trainer?.id ?? ''}
      />
      <BottomNav />
    </>
  )
}
