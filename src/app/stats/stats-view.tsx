'use client'

import { useRouter } from 'next/navigation'
import { HugeiconsIcon, ArrowLeft02Icon, ArrowRight02Icon, ArrowUp01Icon, ArrowDown01Icon } from '@/components/ui/icon'
import type { MonthlyStats } from '@/actions/stats'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type Props = {
  stats: MonthlyStats
  year: number
  month: number
  trainerName: string
}

export function StatsView({ stats, year, month, trainerName }: Props) {
  const router = useRouter()

  function navigateMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 1) { newMonth = 12; newYear-- }
    if (newMonth > 12) { newMonth = 1; newYear++ }
    router.push(`/stats?year=${newYear}&month=${newMonth}`)
  }

  // Income change percentage
  const incomeChange = stats.previousMonthIncome > 0
    ? Math.round(((stats.totalIncome - stats.previousMonthIncome) / stats.previousMonthIncome) * 100)
    : stats.totalIncome > 0 ? 100 : 0

  // Attendance change
  const attendanceChange = stats.previousAttendanceRate > 0
    ? stats.attendanceRate - stats.previousAttendanceRate
    : 0

  // Bar chart max
  const maxSessions = Math.max(...stats.sessionsThisWeek.map(s => s.count), 1)

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">Analytics</p>
            <h1 className="text-2xl font-medium text-neutral-900">My Stats</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white text-sm font-medium">
            {trainerName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between rounded-card border border-neutral-200 bg-white px-4 py-3">
          <button onClick={() => navigateMonth(-1)} className="p-1">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={20} color="currentColor" className="text-neutral-600" />
          </button>
          <span className="text-sm font-medium text-neutral-900">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-1">
            <HugeiconsIcon icon={ArrowRight02Icon} size={20} color="currentColor" className="text-neutral-600" />
          </button>
        </div>

        {/* Total Income Card */}
        <div className="rounded-card bg-neutral-800 px-5 py-5">
          <p className="text-sm text-white/70">Total Income</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-medium text-white">
              MVR {stats.totalIncome.toLocaleString()}
            </span>
            {incomeChange !== 0 && (
              <span className="flex items-center gap-1 rounded-base bg-white/20 px-2 py-0.5 text-xs text-white">
                {incomeChange > 0 ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} size={12} color="currentColor" />
                ) : (
                  <HugeiconsIcon icon={ArrowDown01Icon} size={12} color="currentColor" />
                )}
                {incomeChange > 0 ? '+' : ''}{incomeChange}%
              </span>
            )}
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Clients */}
          <div className="rounded-card border border-neutral-200 bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">Active Clients</p>
            <p className="mt-1 text-2xl font-medium text-neutral-900">{stats.activeClients}</p>
            {stats.newClientsThisMonth > 0 && (
              <p className="mt-1 text-xs text-neutral-500">+{stats.newClientsThisMonth} this month</p>
            )}
          </div>

          {/* Attendance Rate */}
          <div className="rounded-card border border-neutral-200 bg-white px-4 py-4">
            <p className="text-xs text-neutral-500">Attendance Rate</p>
            <p className="mt-1 text-2xl font-medium text-neutral-900">{stats.attendanceRate}%</p>
            {attendanceChange !== 0 && (
              <p className="mt-1 text-xs text-neutral-500">
                {attendanceChange > 0 ? '+' : ''}{attendanceChange}% vs last
              </p>
            )}
          </div>
        </div>

        {/* Payment Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-card bg-success-50 px-3 py-3">
            <p className="text-2xl font-medium text-success-700">{stats.paymentStatus.active}</p>
            <p className="text-xs text-success-700">Active</p>
          </div>
          <div className="rounded-card bg-warning-50 px-3 py-3">
            <p className="text-2xl font-medium text-warning-700">{stats.paymentStatus.expiring}</p>
            <p className="text-xs text-warning-700">Expiring</p>
          </div>
          <div className="rounded-card bg-danger-50 px-3 py-3">
            <p className="text-2xl font-medium text-danger-700">{stats.paymentStatus.expired}</p>
            <p className="text-xs text-danger-700">Expired</p>
          </div>
        </div>

        {/* Sessions This Week */}
        <div className="rounded-card border border-neutral-200 bg-white px-5 py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-900">Sessions This Week</p>
            <p className="text-xs text-neutral-500">{stats.totalSessionsThisWeek} total</p>
          </div>

          {/* Bar Chart */}
          <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 120 }}>
            {stats.sessionsThisWeek.map((s) => (
              <div key={s.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: 96 }}>
                  <div
                    className="w-full rounded-t-base bg-neutral-800 transition-all"
                    style={{
                      height: s.count > 0 ? Math.max((s.count / maxSessions) * 96, 4) : 0,
                    }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">{s.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
