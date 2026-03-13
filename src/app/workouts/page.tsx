import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getTrainerWorkouts } from '@/actions/workouts'
import { WorkoutsView } from './workouts-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function WorkoutsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const workouts = await getTrainerWorkouts()

  return (
    <>
      <WorkoutsView workouts={workouts} />
      <BottomNav />
    </>
  )
}
