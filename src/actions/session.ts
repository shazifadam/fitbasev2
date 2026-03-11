'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAbsent(attendanceId: string) {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('attendance')
    .update({ status: 'missed' })
    .eq('id', attendanceId)

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function startSession(attendanceId: string, workoutId: string | null) {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('attendance')
    .update({
      status: 'attending',
      session_started_at: new Date().toISOString(),
      session_workout_id: workoutId,
    })
    .eq('id', attendanceId)

  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath('/attending')
}
