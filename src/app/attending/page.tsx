import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAttendingSessions } from '@/actions/attending'
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

  return (
    <>
      <AttendingView
        sessions={sessions}
        trainerName={trainer?.display_name ?? 'Trainer'}
      />
      <BottomNav />
    </>
  )
}
