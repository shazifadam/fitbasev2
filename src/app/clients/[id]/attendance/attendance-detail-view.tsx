'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FilterIcon,
  Download04Icon,
  Cancel01Icon,
  Calendar01Icon,
} from '@/components/ui/icon'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { getClientAttendanceRange } from '@/actions/clients'
import type { ClientDetail, AttendanceHistoryRow } from '@/actions/clients'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function statusColor(status: string | null): string {
  if (status === 'attended') return 'bg-success-600 text-white'
  if (status === 'missed') return 'bg-danger-600 text-white'
  if (status === 'attending') return 'bg-warning-500 text-white'
  if (status === 'rescheduled') return 'bg-neutral-400 text-white'
  return 'bg-neutral-200 text-neutral-600' // scheduled
}

function statusBadge(status: string | null): { label: string; cls: string } {
  if (status === 'attended') return { label: 'Attended', cls: 'text-success-600' }
  if (status === 'missed') return { label: 'Missed', cls: 'bg-danger-100 text-danger-600 px-2 py-0.5 rounded-base' }
  if (status === 'rescheduled') return { label: 'Rescheduled', cls: 'text-neutral-500' }
  if (status === 'attending') return { label: 'In Session', cls: 'text-warning-600' }
  return { label: 'Scheduled', cls: 'text-neutral-400' }
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

function durationMinutes(start: string | null, end: string | null): string {
  if (!start || !end) return ''
  const diffMs = new Date(end).getTime() - new Date(start).getTime()
  if (diffMs <= 0) return ''
  return `${Math.round(diffMs / 60000)} min`
}

function formatInputDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Calendar Grid ───────────────────────────────────────────────────────────

function CalendarGrid({
  year,
  month,
  attendance,
}: {
  year: number
  month: number
  attendance: AttendanceHistoryRow[]
}) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  // Map date → status
  const dateStatus = useMemo(() => {
    const map = new Map<number, string | null>()
    for (const a of attendance) {
      const day = Number(a.scheduled_date.split('-')[2])
      // Keep highest priority: attending > attended > missed > rescheduled > scheduled
      const existing = map.get(day)
      if (!existing || priorityOf(a.status) > priorityOf(existing)) {
        map.set(day, a.status)
      }
    }
    return map
  }, [attendance])

  function priorityOf(status: string | null): number {
    if (status === 'attending') return 5
    if (status === 'attended') return 4
    if (status === 'missed') return 3
    if (status === 'rescheduled') return 2
    if (status === 'scheduled') return 1
    return 0
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex flex-col gap-2 rounded-base bg-white border border-neutral-200 p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="flex items-center justify-center py-1">
            <span className="text-[11px] font-normal text-neutral-400">{d}</span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="h-9" />
          const status = dateStatus.get(day)
          const hasStatus = status !== undefined
          return (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-full mx-auto text-[13px] font-normal ${
                hasStatus ? statusColor(status) : ''
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success-600" />
          <span className="text-[11px] font-normal text-neutral-500">Attended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-danger-600" />
          <span className="text-[11px] font-normal text-neutral-500">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="text-[11px] font-normal text-neutral-500">Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
          <span className="text-[11px] font-normal text-neutral-500">Rescheduled</span>
        </div>
      </div>
    </div>
  )
}

// ─── Export Drawer ────────────────────────────────────────────────────────────

function ExportDrawer({
  open,
  onClose,
  clientName,
  attendance,
  year,
  month,
}: {
  open: boolean
  onClose: () => void
  clientName: string
  attendance: AttendanceHistoryRow[]
  year: number
  month: number
}) {
  const lastDay = new Date(year, month, 0).getDate()
  const [fromDate, setFromDate] = useState(`${year}-${String(month).padStart(2, '0')}-01`)
  const [toDate, setToDate] = useState(`${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
  const [format, setFormat] = useState<'csv' | 'excel'>('csv')

  function handleExport() {
    // Filter attendance by date range
    const filtered = attendance.filter(a => a.scheduled_date >= fromDate && a.scheduled_date <= toDate)

    if (format === 'csv') {
      const header = 'Date,Time,Status,Session Start,Session End\n'
      const rows = filtered.map(a =>
        `${a.scheduled_date},${formatTime(a.scheduled_time)},${a.status ?? 'scheduled'},${a.session_started_at ?? ''},${a.session_ended_at ?? ''}`
      ).join('\n')
      const csv = header + rows
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${clientName.replace(/\s+/g, '_')}_attendance_${fromDate}_to_${toDate}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }

    onClose()
  }

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) onClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Export Attendance</span>
            <button onClick={onClose} className="text-neutral-400">
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="currentColor" />
            </button>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-neutral-950">Date Range</span>
            <div className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2 h-11 rounded-base border border-neutral-200 px-3 bg-white">
                <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" className="text-neutral-400 shrink-0" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full text-[13px] font-normal text-neutral-950 outline-none bg-transparent"
                />
              </label>
              <span className="text-[13px] font-normal text-neutral-400">to</span>
              <label className="flex flex-1 items-center gap-2 h-11 rounded-base border border-neutral-200 px-3 bg-white">
                <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" className="text-neutral-400 shrink-0" />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full text-[13px] font-normal text-neutral-950 outline-none bg-transparent"
                />
              </label>
            </div>
          </div>

          {/* Format */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-neutral-950">Format</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('csv')}
                className={`flex flex-1 h-11 items-center justify-center gap-2 rounded-base border text-[14px] font-normal ${
                  format === 'csv'
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-200 bg-white text-neutral-950'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setFormat('excel')}
                className={`flex flex-1 h-11 items-center justify-center gap-2 rounded-base border text-[14px] font-normal ${
                  format === 'excel'
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-200 bg-white text-neutral-950'
                }`}
              >
                Excel
              </button>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white"
          >
            <HugeiconsIcon icon={Download04Icon} size={18} color="currentColor" />
            Export
          </button>

          <button
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center text-[15px] font-normal text-neutral-400"
          >
            Cancel
          </button>
        </div>
      </BottomDrawerContent>
    </BottomDrawer>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

type Props = {
  client: ClientDetail
  attendance: AttendanceHistoryRow[]
  year: number
  month: number
}

export function AttendanceDetailView({ client, attendance, year, month }: Props) {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [filterActive, setFilterActive] = useState(false)

  const lastDay = new Date(year, month, 0).getDate()
  const [fromDate, setFromDate] = useState(`${year}-${String(month).padStart(2, '0')}-01`)
  const [toDate, setToDate] = useState(`${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
  const [filteredData, setFilteredData] = useState<AttendanceHistoryRow[] | null>(null)

  // Summary stats
  const stats = useMemo(() => {
    const data = filteredData ?? attendance
    const attended = data.filter(a => a.status === 'attended').length
    const missed = data.filter(a => a.status === 'missed').length
    const scheduled = data.filter(a => a.status === 'scheduled').length
    const total = attended + missed
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0
    return { attended, missed, scheduled, total: data.length, rate }
  }, [attendance, filteredData])

  const displayData = filteredData ?? attendance

  function handlePrevMonth() {
    const m = month === 1 ? 12 : month - 1
    const y = month === 1 ? year - 1 : year
    router.push(`/clients/${client.id}/attendance?month=${y}-${String(m).padStart(2, '0')}`)
  }

  function handleNextMonth() {
    const m = month === 12 ? 1 : month + 1
    const y = month === 12 ? year + 1 : year
    router.push(`/clients/${client.id}/attendance?month=${y}-${String(m).padStart(2, '0')}`)
  }

  async function handleApplyFilter() {
    const data = await getClientAttendanceRange(client.id, fromDate, toDate)
    setFilteredData(data)
    setFilterActive(true)
    setShowFilter(false)
  }

  function handleClearFilter() {
    setFilteredData(null)
    setFilterActive(false)
    setFromDate(`${year}-${String(month).padStart(2, '0')}-01`)
    setToDate(`${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-5 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" className="text-neutral-950" />
            </button>
            <div className="flex flex-col">
              <span className="text-[12px] font-normal text-neutral-500">Back to Client</span>
              <span className="text-[20px] font-medium text-neutral-950">{client.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex h-9 w-9 items-center justify-center rounded-base border ${
                showFilter || filterActive ? 'border-neutral-800 bg-neutral-800' : 'border-neutral-200 bg-white'
              }`}
            >
              <HugeiconsIcon icon={FilterIcon} size={18} color="currentColor" className={showFilter || filterActive ? 'text-white' : 'text-neutral-600'} />
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="flex h-9 w-9 items-center justify-center rounded-base border border-neutral-200 bg-white"
            >
              <HugeiconsIcon icon={Download04Icon} size={18} color="currentColor" className="text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Filter active badge */}
        {filterActive && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-base bg-neutral-800 px-3 py-1.5">
              <HugeiconsIcon icon={FilterIcon} size={14} color="currentColor" className="text-white" />
              <span className="text-[13px] font-normal text-white">
                {formatInputDate(fromDate)} – {formatInputDate(toDate)}
              </span>
              <button onClick={handleClearFilter}>
                <HugeiconsIcon icon={Cancel01Icon} size={14} color="currentColor" className="text-white/70" />
              </button>
            </div>
          </div>
        )}

        {/* Date range filter panel */}
        {showFilter && !filterActive && (
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-medium text-neutral-950">Date Range</span>
            <div className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2 h-11 rounded-base border border-neutral-200 px-3 bg-white">
                <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" className="text-neutral-400 shrink-0" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full text-[13px] font-normal text-neutral-950 outline-none bg-transparent"
                />
              </label>
              <span className="text-[13px] font-normal text-neutral-400">to</span>
              <label className="flex flex-1 items-center gap-2 h-11 rounded-base border border-neutral-200 px-3 bg-white">
                <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" className="text-neutral-400 shrink-0" />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full text-[13px] font-normal text-neutral-950 outline-none bg-transparent"
                />
              </label>
            </div>
            <button
              onClick={handleApplyFilter}
              className="flex h-11 w-full items-center justify-center rounded-base bg-neutral-800 text-[14px] font-normal text-white"
            >
              Apply Filter
            </button>
          </div>
        )}

        {/* Month navigation */}
        {!filterActive && (
          <div className="flex items-center justify-between">
            <button onClick={handlePrevMonth} className="p-1">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="currentColor" className="text-neutral-600" />
            </button>
            <span className="text-base font-medium text-neutral-950">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1">
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="currentColor" className="text-neutral-600" />
            </button>
          </div>
        )}

        {/* Calendar (only when no filter active) */}
        {!filterActive && (
          <CalendarGrid year={year} month={month} attendance={attendance} />
        )}

        {/* Summary Stats */}
        <div className="flex flex-col gap-3">
          {!filterActive && (
            <span className="text-base font-medium text-neutral-950">Monthly Summary</span>
          )}
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base bg-white border border-neutral-200 py-3">
              <span className="text-[22px] font-medium text-success-600">{stats.attended}</span>
              <span className="text-[12px] font-normal text-neutral-500">Attended</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base bg-white border border-neutral-200 py-3">
              <span className={`text-[22px] font-medium ${stats.missed > 0 ? 'text-danger-600' : 'text-neutral-950'}`}>
                {stats.missed}
              </span>
              <span className="text-[12px] font-normal text-neutral-500">Missed</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base bg-white border border-neutral-200 py-3">
              <span className="text-[22px] font-medium text-neutral-950">{stats.scheduled}</span>
              <span className="text-[12px] font-normal text-neutral-500">Scheduled</span>
            </div>
          </div>

          {/* Attendance Rate */}
          {!filterActive && (
            <div className="flex items-center justify-between rounded-base bg-white border border-neutral-200 px-4 py-3">
              <span className="text-[14px] font-normal text-neutral-950">Attendance Rate</span>
              <span className="text-base font-medium text-success-600">{stats.rate}%</span>
            </div>
          )}
        </div>

        {/* Session list (filtered mode or below calendar) */}
        {filterActive && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-neutral-950">Sessions</span>
              <span className="text-[13px] font-normal text-neutral-500">{displayData.length} total</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {displayData.map(a => {
                const badge = statusBadge(a.status)
                const dur = durationMinutes(a.session_started_at, a.session_ended_at)
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-base bg-white border border-neutral-200 px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-medium text-neutral-950">
                        {formatShortDate(a.scheduled_date)}
                      </span>
                      <span className="text-[12px] font-normal text-neutral-400">
                        {formatTime(a.scheduled_time)}
                        {dur ? ` · ${dur}` : ''}
                      </span>
                    </div>
                    <span className={`text-[13px] font-normal ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* Export Drawer */}
      <ExportDrawer
        open={showExport}
        onClose={() => setShowExport(false)}
        clientName={client.name}
        attendance={attendance}
        year={year}
        month={month}
      />
    </main>
  )
}
