import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getExercises } from '@/actions/exercises'
import { ExerciseLibraryView } from './exercise-library-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function ExercisesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const exercises = await getExercises()

  return (
    <>
      <ExerciseLibraryView exercises={exercises} />
      <BottomNav />
    </>
  )
}
