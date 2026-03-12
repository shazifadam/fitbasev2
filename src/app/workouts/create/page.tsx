import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getExercises } from '@/actions/exercises'
import { CreateWorkoutView } from './create-workout-view'

export default async function CreateWorkoutPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const exercises = await getExercises()

  return <CreateWorkoutView exercises={exercises} />
}
