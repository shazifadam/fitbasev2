'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Calendar01Icon, DragDropVerticalIcon, CheckmarkCircle01Icon, CancelCircleIcon } from 'hugeicons-react'
import type { AttendanceWithClient } from '@/actions/dashboard'

const SessionActionDrawer = dynamic(
  () => import('@/components/dashboard/session-action-drawer').then(m => m.SessionActionDrawer),
  { ssr: false }
)
const SelectWorkoutDrawer = dynamic(
  () => import('@/components/dashboard/select-workout-drawer').then(m => m.SelectWorkoutDrawer),
  { ssr: false }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
  return time.slice(0, 5)
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatPrograms(programs: string[] | null | undefined): string {
  if (!programs || programs.length === 0) return ''
  return programs.slice(0, 2).join(' · ')
}

function formatEndedTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  date: string
  attendance: AttendanceWithClient[]
  trainerName: string
}

export function DashboardView({ date, attendance, trainerName }: Props) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<AttendanceWithClient | null>(null)
  const [showWorkoutDrawer, setShowWorkoutDrawer] = useState(false)

  // Correct to client's local timezone on first mount
  useEffect(() => {
    // en-CA locale gives YYYY-MM-DD format
    const localToday = new Date().toLocaleDateString('en-CA')
    if (!window.location.search.includes('date=') && date !== localToday) {
      router.replace(`/dashboard?date=${localToday}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { attending, scheduled, attended, absent } = useMemo(() => ({
    attending: attendance.filter(a => a.status === 'attending'),
    scheduled: attendance.filter(a => a.status === 'scheduled'),
    attended: attendance.filter(a => a.status === 'attended'),
    absent: attendance.filter(a => a.status === 'missed'),
  }), [attendance])

  const timeGroups = useMemo(() => {
    const byTime = scheduled.reduce<Record<string, AttendanceWithClient[]>>(
      (acc, item) => {
        const time = formatTime(item.scheduled_time)
        if (!acc[time]) acc[time] = []
        acc[time].push(item)
        return acc
      },
      {}
    )
    return Object.entries(byTime).sort(([a], [b]) => a.localeCompare(b))
  }, [scheduled])

  const initials = getInitials(trainerName)

  const handleSelectItem = useCallback((item: AttendanceWithClient) => setSelectedItem(item), [])
  const handleCloseDrawer = useCallback(() => setSelectedItem(null), [])
  const handleStartSession = useCallback(() => setShowWorkoutDrawer(true), [])
  const handleCloseWorkoutDrawer = useCallback(() => {
    setShowWorkoutDrawer(false)
    setSelectedItem(null)
  }, [])

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-neutral-500">Welcome Back</span>
            <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
              {trainerName}
            </h1>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white text-base font-medium">
            {initials}
          </div>
        </div>

        {/* Date Picker — defaults to today, calendar icon opens native picker */}
        <label className="relative flex items-center justify-between h-12 px-4 bg-white rounded-base border border-neutral-200 cursor-pointer">
          <span className="text-[15px] font-medium text-neutral-950">
            {formatDateLabel(date)}
          </span>
          <Calendar01Icon size={20} color="currentColor" className="text-neutral-400 shrink-0" />
          <input
            type="date"
            value={date}
            onChange={e => router.push(`/dashboard?date=${e.target.value}`)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        {/* Summary Banner — taps through to /attending */}
        <Link
          href="/attending"
          className="flex items-center justify-between rounded-base bg-neutral-800 px-4 py-4"
        >
          <span className="text-[15px] font-medium text-white">Attending</span>
          <div className="flex items-center justify-center rounded-full bg-white/[0.13] px-[14px] py-[6px]">
            <span className="text-[13px] font-medium text-white">
              {attending.length} attending
            </span>
          </div>
        </Link>

        {/* Time Groups — scheduled only */}
        {timeGroups.map(([time, clients]) => (
          <div key={time} className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-neutral-500">{time}</span>
            {clients.map(item => (
              <button
                key={item.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4 w-full text-left"
                onClick={() => handleSelectItem(item)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-neutral-950">
                    {item.clients?.name}
                  </span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {formatPrograms(item.clients?.training_programs)}
                  </span>
                </div>
                <DragDropVerticalIcon size={18} color="currentColor" className="text-neutral-300 shrink-0" />
              </button>
            ))}
          </div>
        ))}

        {/* Attended Section */}
        {attended.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-medium text-neutral-950">Attended</h2>
            {attended.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-neutral-950">
                    {item.clients?.name}
                  </span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {formatPrograms(item.clients?.training_programs)}
                  </span>
                  {item.session_ended_at && (
                    <span className="text-[12px] font-normal text-neutral-400">
                      Marked as attended at {formatEndedTime(item.session_ended_at)}
                    </span>
                  )}
                </div>
                <CheckmarkCircle01Icon size={20} color="currentColor" className="text-success-600 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Absent Section */}
        {absent.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-medium text-neutral-950">Absent</h2>
            {absent.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-neutral-950">
                    {item.clients?.name}
                  </span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {formatPrograms(item.clients?.training_programs)}
                  </span>
                </div>
                <CancelCircleIcon size={20} color="currentColor" className="text-danger-600 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {attendance.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-[15px] font-normal text-neutral-400">
              No sessions scheduled for this day
            </span>
          </div>
        )}

      </div>

      {/* Session Action Drawer */}
      <SessionActionDrawer
        open={selectedItem !== null && !showWorkoutDrawer}
        attendance={selectedItem}
        onClose={handleCloseDrawer}
        onStartSession={handleStartSession}
      />

      {/* Select Workout Drawer */}
      <SelectWorkoutDrawer
        open={showWorkoutDrawer}
        attendance={selectedItem}
        onClose={handleCloseWorkoutDrawer}
      />

    </main>
  )
}
