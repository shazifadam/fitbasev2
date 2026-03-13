import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getExercises } from '@/actions/exercises'
import { ExerciseLibraryView } from './exercise-library-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function ExercisesPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const exercises = await getExercises()

  return (
    <>
      <ExerciseLibraryView exercises={exercises} />
      <BottomNav />
    </>
  )
}
