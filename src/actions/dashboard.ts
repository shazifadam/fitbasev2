'use server'

import { createServerClient, createServerClientUntyped } from '@/lib/supabase/server'

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

// ─── Schedule helpers ────────────────────────────────────────────────────────

const SCHEDULE_DAYS: Record<string, string[]> = {
  sunday:   ['Sun', 'Tue', 'Thu'],
  saturday: ['Sat', 'Mon', 'Wed'],
}

const DAY_ABBR_TO_NUM: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

/**
 * Ensure every active client who is scheduled for `date` (by their schedule_set
 * and session_times) has an attendance record. This fixes the gap where
 * pre-generated records may not cover today's date.
 */
async function ensureAttendanceForDate(date: string) {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return

  const trainerId = (trainer as { id: string }).id

  // Which day-of-week is `date`?
  const [y, m, d] = date.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay() // 0=Sun … 6=Sat
  const dayAbbr = Object.entries(DAY_ABBR_TO_NUM).find(([, n]) => n === dayOfWeek)?.[0]
  if (!dayAbbr) return

  // Get all active clients for this trainer whose schedule includes today's day
  const { data: clients } = await supabase
    .from('clients')
    .select('id, schedule_set, custom_days, session_times')
    .eq('trainer_id', trainerId)
    .eq('is_archived', false)

  if (!clients || clients.length === 0) return

  // Filter to clients who should train on this day
  const scheduledClients = (clients as { id: string; schedule_set: string; custom_days: string[] | null; session_times: Record<string, string> | null }[])
    .filter(c => {
      const days = c.schedule_set === 'custom'
        ? (c.custom_days ?? [])
        : (SCHEDULE_DAYS[c.schedule_set] ?? [])
      return days.includes(dayAbbr)
    })

  if (scheduledClients.length === 0) return

  // Check which already have records for this date
  const clientIds = scheduledClients.map(c => c.id)
  const { data: existing } = await supabase
    .from('attendance')
    .select('client_id')
    .eq('scheduled_date', date)
    .in('client_id', clientIds)

  const existingSet = new Set((existing ?? []).map((r: { client_id: string }) => r.client_id))

  // Create missing records
  const missing = scheduledClients
    .filter(c => !existingSet.has(c.id))
    .map(c => ({
      client_id: c.id,
      trainer_id: trainerId,
      scheduled_date: date,
      scheduled_time: (c.session_times as Record<string, string> | null)?.[dayAbbr] ?? '06:00',
      status: 'scheduled',
    }))

  if (missing.length > 0) {
    await supabase.from('attendance').insert(missing)
  }
}

export async function getAttendanceForDate(date: string): Promise<AttendanceWithClient[]> {
  // Ensure all scheduled clients have records for this date
  await ensureAttendanceForDate(date)

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
  id: string
  display_name: string | null
  photo_url: string | null
}

export async function getTrainerProfile(): Promise<TrainerProfile | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id, display_name, photo_url')
    .eq('auth_id', user.id)
    .single()

  return data as TrainerProfile | null
}
