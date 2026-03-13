import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getWorkoutDetail } from '@/actions/workouts'
import { WorkoutDetailView } from './workout-detail-view'

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params
  const workout = await getWorkoutDetail(id)

  if (!workout) notFound()

  return <WorkoutDetailView workout={workout} />
}
