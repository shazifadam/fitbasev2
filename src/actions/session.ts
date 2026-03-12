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

export async function rescheduleSession(
  attendanceId: string,
  newDate: string,
  newTime: string,
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()

  // Fetch the original record to copy client_id and trainer_id
  const { data: original, error: fetchErr } = await supabase
    .from('attendance')
    .select('client_id, trainer_id')
    .eq('id', attendanceId)
    .single()

  if (fetchErr || !original) return { error: 'Could not find original session' }

  // Mark old record as rescheduled
  const { error: updateErr } = await supabase
    .from('attendance')
    .update({ status: 'rescheduled' })
    .eq('id', attendanceId)

  if (updateErr) return { error: updateErr.message }

  // Create new scheduled record on the new date/time
  const { error: insertErr } = await supabase
    .from('attendance')
    .insert({
      client_id: (original as { client_id: string }).client_id,
      trainer_id: (original as { trainer_id: string }).trainer_id,
      scheduled_date: newDate,
      scheduled_time: newTime,
      status: 'scheduled',
    })

  if (insertErr) return { error: insertErr.message }

  revalidatePath('/dashboard')
  return {}
}

export async function undoAttendance(attendanceId: string) {
  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('attendance')
    .update({
      status: 'scheduled',
      session_started_at: null,
      session_ended_at: null,
      session_workout_id: null,
      exercise_weights: null,
    })
    .eq('id', attendanceId)

  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath('/attending')
}
