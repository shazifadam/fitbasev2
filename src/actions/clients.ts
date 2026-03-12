'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientRow = {
  id: string
  name: string
  training_programs: string[] | null
  schedule_set: string
  tier_id: string | null
}

export type TierRow = {
  id: string
  name: string
}

export type CreateClientInput = {
  name: string
  phone: string
  training_programs: string[]
  tier_id: string | null
  schedule_set: 'sunday' | 'saturday' | 'custom'
  custom_days: string[]
  session_times: Record<string, string>
}

// ─── Attendance Auto-Generation ───────────────────────────────────────────────

const DAY_TO_NUM: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

function getScheduleDays(scheduleSet: string, customDays: string[]): string[] {
  if (scheduleSet === 'sunday')   return ['Sun', 'Tue', 'Thu']
  if (scheduleSet === 'saturday') return ['Sat', 'Mon', 'Wed']
  return customDays
}

function generateAttendanceRecords(
  clientId: string,
  trainerId: string,
  days: string[],
  sessionTimes: Record<string, string>,
  fromDateStr: string,
  weeks = 8,
) {
  const [y, m, d] = fromDateStr.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const records = []

  for (const day of days) {
    const dayNum = DAY_TO_NUM[day]
    if (dayNum === undefined) continue
    const time = sessionTimes[day] ?? '06:00'

    const curr = new Date(start)
    const diff = (dayNum - curr.getDay() + 7) % 7
    curr.setDate(curr.getDate() + diff)

    for (let i = 0; i < weeks; i++) {
      const yyyy = curr.getFullYear()
      const mm = String(curr.getMonth() + 1).padStart(2, '0')
      const dd = String(curr.getDate()).padStart(2, '0')
      records.push({
        client_id: clientId,
        trainer_id: trainerId,
        scheduled_date: `${yyyy}-${mm}-${dd}`,
        scheduled_time: time,
        status: 'scheduled',
      })
      curr.setDate(curr.getDate() + 7)
    }
  }

  return records
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<ClientRow[]> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, training_programs, schedule_set, tier_id')
    .eq('is_archived', false)
    .order('name', { ascending: true })

  if (error) {
    console.error('getClients error:', error)
    return []
  }

  return (data ?? []) as ClientRow[]
}

export async function getTiers(): Promise<TierRow[]> {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return []

  const trainerId = (trainer as { id: string }).id

  const { data: existing } = await supabase
    .from('tiers')
    .select('id, name')
    .eq('trainer_id', trainerId)
    .order('name', { ascending: true })

  if (existing && existing.length > 0) return existing as TierRow[]

  // TODO: remove auto-seed once tier management page is built
  const defaults = [
    { name: 'Basic',    color: '#262626', amount: 0, max_concurrent_clients: 10, trainer_id: trainerId, is_default: true },
    { name: 'Standard', color: '#262626', amount: 0, max_concurrent_clients: 20, trainer_id: trainerId, is_default: false },
    { name: 'Premium',  color: '#262626', amount: 0, max_concurrent_clients: 30, trainer_id: trainerId, is_default: false },
  ]
  const { data: seeded } = await supabase.from('tiers').insert(defaults).select('id, name')
  return (seeded ?? []) as TierRow[]
}

// ─── Detail ──────────────────────────────────────────────────────────────────

export type ClientDetail = {
  id: string
  name: string
  phone: string
  training_programs: string[] | null
  schedule_set: string
  custom_days: string[] | null
  session_times: Record<string, string> | null
  tier_id: string | null
  current_weight: number | null
  current_waist: number | null
  current_fat_percent: number | null
  current_height: number | null
  created_at: string | null
  tiers: { name: string } | null
}

export type AttendanceHistoryRow = {
  id: string
  scheduled_date: string
  scheduled_time: string
  status: string | null
  session_started_at: string | null
  session_ended_at: string | null
}

export async function getClientDetail(clientId: string): Promise<ClientDetail | null> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('clients')
    .select(`
      id, name, phone, training_programs, schedule_set, custom_days,
      session_times, tier_id, current_weight, current_waist,
      current_fat_percent, current_height, created_at,
      tiers(name)
    `)
    .eq('id', clientId)
    .single()

  if (error || !data) return null
  return data as unknown as ClientDetail
}

export async function getClientAttendance(clientId: string): Promise<AttendanceHistoryRow[]> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('attendance')
    .select('id, scheduled_date, scheduled_time, status, session_started_at, session_ended_at')
    .eq('client_id', clientId)
    .order('scheduled_date', { ascending: false })
    .limit(20)

  if (error) return []
  return (data ?? []) as AttendanceHistoryRow[]
}

// ─── Monthly Attendance ──────────────────────────────────────────────────────

export async function getClientAttendanceRange(
  clientId: string,
  from: string,
  to: string,
): Promise<AttendanceHistoryRow[]> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('attendance')
    .select('id, scheduled_date, scheduled_time, status, session_started_at, session_ended_at')
    .eq('client_id', clientId)
    .gte('scheduled_date', from)
    .lte('scheduled_date', to)
    .order('scheduled_date', { ascending: true })

  if (error) return []
  return (data ?? []) as AttendanceHistoryRow[]
}

// ─── Payment Status ──────────────────────────────────────────────────────────

export type PaymentStatus = {
  lastPaymentDate: string | null
  validUntil: string | null
  amount: number | null
  currency: string
  isOverdue: boolean
}

export async function getClientPaymentStatus(clientId: string): Promise<PaymentStatus> {
  const supabase = await createServerClientUntyped()

  const { data } = await supabase
    .from('payments')
    .select('payment_date, valid_until, amount, currency')
    .eq('client_id', clientId)
    .order('payment_date', { ascending: false })
    .limit(1)
    .single()

  if (!data) return { lastPaymentDate: null, validUntil: null, amount: null, currency: 'OMR', isOverdue: false }

  const payment = data as { payment_date: string; valid_until: string; amount: number; currency: string }
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = payment.valid_until < today

  return {
    lastPaymentDate: payment.payment_date,
    validUntil: payment.valid_until,
    amount: payment.amount,
    currency: payment.currency ?? 'OMR',
    isOverdue,
  }
}

// ─── Client Workouts ─────────────────────────────────────────────────────────

export type ClientWorkout = {
  id: string
  name: string
  exercises: { name: string; sets: number }[]
}

export async function getClientWorkouts(clientId: string): Promise<ClientWorkout[]> {
  const supabase = await createServerClientUntyped()

  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, workout_exercises(order_index, sets, exercises(name))')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return (data as unknown as {
    id: string
    name: string
    workout_exercises: { order_index: number; sets: unknown; exercises: { name: string } }[]
  }[]).map(w => ({
    id: w.id,
    name: w.name,
    exercises: (w.workout_exercises ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(we => ({
        name: we.exercises?.name ?? 'Unknown',
        sets: Array.isArray(we.sets) ? (we.sets as unknown[]).length : 0,
      })),
  }))
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createClient(
  input: CreateClientInput
): Promise<{ error?: string }> {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!trainer) return { error: 'Trainer profile not found. Please sign out and sign in again.' }

  const trainerId = (trainer as { id: string }).id

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      phone: input.phone,
      training_programs: input.training_programs,
      tier_id: input.tier_id || null,
      schedule_set: input.schedule_set,
      custom_days: input.custom_days,
      session_times: input.session_times,
      trainer_id: trainerId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  if (!client) return { error: 'Failed to create client' }

  // Auto-generate attendance records for the next 8 weeks
  const today = new Date()
  const fromDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const days = getScheduleDays(input.schedule_set, input.custom_days)
  const attendanceRows = generateAttendanceRecords(
    (client as { id: string }).id,
    trainerId,
    days,
    input.session_times,
    fromDate,
  )

  if (attendanceRows.length > 0) {
    await supabase.from('attendance').insert(attendanceRows)
  }

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  return {}
}
