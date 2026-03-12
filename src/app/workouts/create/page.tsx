import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getExercises } from '@/actions/exercises'
import { CreateWorkoutView } from './create-workout-view'

export default async function CreateWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const exercises = await getExercises()

  return <CreateWorkoutView exercises={exercises} clientId={params.client_id ?? null} />
}
