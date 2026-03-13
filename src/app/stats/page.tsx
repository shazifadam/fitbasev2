import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getMonthlyStats } from '@/actions/stats'
import { getTrainerProfile } from '@/actions/dashboard'
import { StatsView } from './stats-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1

  const [stats, trainer] = await Promise.all([
    getMonthlyStats(year, month),
    getTrainerProfile(),
  ])

  return (
    <>
      <StatsView
        stats={stats}
        year={year}
        month={month}
        trainerName={trainer?.display_name ?? 'Trainer'}
      />
      <BottomNav />
    </>
  )
}
