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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

function getWeekRange(): { start: string; end: string; dayLabels: string[] } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  // Start from Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return { start: fmt(monday), end: fmt(sunday), dayLabels }
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
  const { start, end } = getMonthRange(year, month)

  // Previous month
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prev = getMonthRange(prevYear, prevMonth)

  // Run all queries in parallel
  const [
    paymentsRes,
    prevPaymentsRes,
    clientsRes,
    attendanceRes,
    prevAttendanceRes,
    weekAttendanceRes,
  ] = await Promise.all([
    // Payments this month
    supabase
      .from('payments')
      .select('amount')
      .eq('trainer_id', trainerId)
      .gte('payment_date', start)
      .lte('payment_date', end),

    // Payments previous month
    supabase
      .from('payments')
      .select('amount')
      .eq('trainer_id', trainerId)
      .gte('payment_date', prev.start)
      .lte('payment_date', prev.end),

    // All active clients with their latest payment
    supabase
      .from('clients')
      .select('id, created_at')
      .eq('trainer_id', trainerId)
      .eq('is_archived', false),

    // Attendance this month
    supabase
      .from('attendance')
      .select('status')
      .eq('trainer_id', trainerId)
      .gte('scheduled_date', start)
      .lte('scheduled_date', end)
      .in('status', ['attended', 'missed', 'scheduled', 'attending']),

    // Attendance previous month
    supabase
      .from('attendance')
      .select('status')
      .eq('trainer_id', trainerId)
      .gte('scheduled_date', prev.start)
      .lte('scheduled_date', prev.end)
      .in('status', ['attended', 'missed']),

    // This week's sessions (attended)
    (() => {
      const { start: wStart, end: wEnd } = getWeekRange()
      return supabase
        .from('attendance')
        .select('scheduled_date, status')
        .eq('trainer_id', trainerId)
        .gte('scheduled_date', wStart)
        .lte('scheduled_date', wEnd)
        .eq('status', 'attended')
    })(),
  ])

  // ── Total Income ──
  const payments = (paymentsRes.data ?? []) as { amount: number }[]
  const totalIncome = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const prevPayments = (prevPaymentsRes.data ?? []) as { amount: number }[]
  const previousMonthIncome = prevPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  // ── Active Clients ──
  const clients = (clientsRes.data ?? []) as { id: string; created_at: string }[]
  const activeClients = clients.length
  const newClientsThisMonth = clients.filter(c => {
    const created = c.created_at.split('T')[0]
    return created >= start && created <= end
  }).length

  // ── Attendance Rate ──
  const attendance = (attendanceRes.data ?? []) as { status: string }[]
  const completedSessions = attendance.filter(a => a.status === 'attended').length
  const totalAccountedSessions = attendance.filter(a => a.status === 'attended' || a.status === 'missed').length
  const attendanceRate = totalAccountedSessions > 0
    ? Math.round((completedSessions / totalAccountedSessions) * 100)
    : 0

  const prevAttendance = (prevAttendanceRes.data ?? []) as { status: string }[]
  const prevCompleted = prevAttendance.filter(a => a.status === 'attended').length
  const prevTotal = prevAttendance.length
  const previousAttendanceRate = prevTotal > 0
    ? Math.round((prevCompleted / prevTotal) * 100)
    : 0

  // ── Payment Status ──
  // Fetch latest payment per client to determine status
  const today = new Date().toISOString().split('T')[0]
  const { data: latestPayments } = await supabase
    .from('payments')
    .select('client_id, valid_until')
    .eq('trainer_id', trainerId)
    .order('payment_date', { ascending: false })

  const paymentsByClient = new Map<string, string>()
  for (const p of (latestPayments ?? []) as { client_id: string; valid_until: string | null }[]) {
    if (!paymentsByClient.has(p.client_id)) {
      paymentsByClient.set(p.client_id, p.valid_until ?? '')
    }
  }

  let active = 0
  let expiring = 0
  let expired = 0
  for (const client of clients) {
    const validUntil = paymentsByClient.get(client.id)
    if (!validUntil) {
      expired++
      continue
    }
    if (validUntil < today) {
      expired++
    } else {
      // Expiring = valid_until is within 7 days
      const daysUntil = Math.ceil(
        (new Date(validUntil).getTime() - new Date(today).getTime()) / 86400000
      )
      if (daysUntil <= 7) {
        expiring++
      } else {
        active++
      }
    }
  }

  // ── Sessions This Week ──
  const { dayLabels } = getWeekRange()
  const weekSessions = (weekAttendanceRes.data ?? []) as { scheduled_date: string; status: string }[]

  // Count per day of week
  const sessionsMap = new Map<string, number>()
  for (const s of weekSessions) {
    const d = new Date(s.scheduled_date + 'T00:00:00')
    const dayIdx = (d.getDay() + 6) % 7 // Mon=0
    const label = dayLabels[dayIdx]
    sessionsMap.set(label, (sessionsMap.get(label) ?? 0) + 1)
  }

  const sessionsThisWeek = dayLabels.map(day => ({
    day,
    count: sessionsMap.get(day) ?? 0,
  }))
  const totalSessionsThisWeek = weekSessions.length

  return {
    totalIncome,
    previousMonthIncome,
    activeClients,
    newClientsThisMonth,
    attendanceRate,
    previousAttendanceRate,
    paymentStatus: { active, expiring, expired },
    sessionsThisWeek,
    totalSessionsThisWeek,
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
