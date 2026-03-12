import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getTrainerWorkouts } from '@/actions/workouts'
import { WorkoutsView } from './workouts-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function WorkoutsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workouts = await getTrainerWorkouts()

  return (
    <>
      <WorkoutsView workouts={workouts} />
      <BottomNav />
    </>
  )
}
