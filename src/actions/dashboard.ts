'use server'

import { createServerClient } from '@/lib/supabase/server'

export type AttendanceWithClient = {
  id: string
  client_id: string
  scheduled_date: string
  scheduled_time: string
  status: string | null
  session_started_at: string | null
  session_ended_at: string | null
  session_workout_id: string | null
  clients: {
    name: string
    training_programs: string[] | null
  } | null
}

export async function getAttendanceForDate(date: string): Promise<AttendanceWithClient[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('attendance')
    .select('id, client_id, scheduled_date, scheduled_time, status, session_started_at, session_ended_at, session_workout_id, clients(name, training_programs)')
    .eq('scheduled_date', date)
    .order('scheduled_time', { ascending: true })

  if (error) {
    console.error('getAttendanceForDate error:', error)
    return []
  }

  return (data ?? []) as AttendanceWithClient[]
}

export type TrainerProfile = {
  display_name: string | null
  photo_url: string | null
}

export async function getTrainerProfile(): Promise<TrainerProfile | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('display_name, photo_url')
    .eq('auth_id', user.id)
    .single()

  return data as TrainerProfile | null
}
