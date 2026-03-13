import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAttendingSessions, getPreviousSessionWeights } from '@/actions/attending'
import type { ExerciseWeights } from '@/actions/attending'
import { getTrainerProfile } from '@/actions/dashboard'
import { AttendingView } from './attending-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function AttendingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [sessions, trainer] = await Promise.all([
    getAttendingSessions(),
    getTrainerProfile(),
  ])

  // Fetch previous weights for all sessions in parallel
  const previousWeightsEntries = await Promise.all(
    sessions.map(async (s) => {
      const prev = await getPreviousSessionWeights(s.client_id, s.session_workout_id)
      return [s.id, prev] as [string, ExerciseWeights | null]
    })
  )
  const previousWeights: Record<string, ExerciseWeights | null> = Object.fromEntries(previousWeightsEntries)

  return (
    <>
      <AttendingView
        sessions={sessions}
        trainerName={trainer?.display_name ?? 'Trainer'}
        previousWeights={previousWeights}
      />
      <BottomNav />
    </>
  )
}
