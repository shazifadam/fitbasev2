import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getWorkoutDetail } from '@/actions/workouts'
import { getExercises } from '@/actions/exercises'
import { EditWorkoutView } from './edit-workout-view'

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params
  const [workout, exercises] = await Promise.all([
    getWorkoutDetail(id),
    getExercises(),
  ])

  if (!workout) notFound()

  return <EditWorkoutView workout={workout} exercises={exercises} />
}
