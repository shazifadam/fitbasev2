'use server'

import { createServerClientUntyped } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonthlyStats = {
  totalIncome: number
  previousMonthIncome: number
  activeClients: number
  newClientsThisMonth: number
  attendanceRate: number
  previousAttendanceRate: number
  paymentStatus: {
    active: number
    expiring: number
    expired: number
  }
  sessionsThisWeek: {
    day: string
    count: number
  }[]
  totalSessionsThisWeek: number
}

// ─── Query ────────────────────────────────────────────────────────────────────

export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
  const supabase = await createServerClientUntyped()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return emptyStats()

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) return emptyStats()

  const trainerId = (trainer as { id: string }).id

  const { data, error } = await supabase.rpc('get_monthly_stats', {
    p_trainer_id: trainerId,
    p_year: year,
    p_month: month,
  })

  if (error || !data) return emptyStats()

  const d = data as {
    total_income: number
    previous_month_income: number
    active_clients: number
    new_clients_this_month: number
    attendance_rate: number
    previous_attendance_rate: number
    payment_status: { active: number; expiring: number; expired: number }
    sessions_this_week: { day: string; count: number }[]
    total_sessions_this_week: number
  }

  return {
    totalIncome: Number(d.total_income),
    previousMonthIncome: Number(d.previous_month_income),
    activeClients: Number(d.active_clients),
    newClientsThisMonth: Number(d.new_clients_this_month),
    attendanceRate: Number(d.attendance_rate),
    previousAttendanceRate: Number(d.previous_attendance_rate),
    paymentStatus: {
      active: Number(d.payment_status.active),
      expiring: Number(d.payment_status.expiring),
      expired: Number(d.payment_status.expired),
    },
    sessionsThisWeek: d.sessions_this_week,
    totalSessionsThisWeek: Number(d.total_sessions_this_week),
  }
}

function emptyStats(): MonthlyStats {
  return {
    totalIncome: 0,
    previousMonthIncome: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
    attendanceRate: 0,
    previousAttendanceRate: 0,
    paymentStatus: { active: 0, expiring: 0, expired: 0 },
    sessionsThisWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, count: 0 })),
    totalSessionsThisWeek: 0,
  }
}
