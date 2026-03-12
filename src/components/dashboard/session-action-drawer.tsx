'use client'

import { useState, useTransition } from 'react'
import { Calendar01Icon, Cancel01Icon } from 'hugeicons-react'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { markAbsent, rescheduleSession } from '@/actions/session'
import type { AttendanceWithClient } from '@/actions/dashboard'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDateTime(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = d.toLocaleDateString('en-US', { month: 'long' })
  const timeFormatted = time.slice(0, 5)
  return `${weekday}, ${monthName} ${day} at ${timeFormatted}`
}

function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA')
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  attendance: AttendanceWithClient | null
  onClose: () => void
  onStartSession: () => void
}

export function SessionActionDrawer({ open, attendance, onClose, onStartSession }: Props) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'absent' | 'reschedule' | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('06:00')
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setShowReschedule(false)
    setError(null)
    setAction(null)
    onClose()
  }

  function handleMarkAbsent() {
    if (!attendance) return
    setAction('absent')
    setError(null)
    startTransition(async () => {
      await markAbsent(attendance.id)
      setAction(null)
      handleClose()
    })
  }

  function handleRescheduleOpen() {
    setShowReschedule(true)
    setNewDate(todayLocal())
    setNewTime(attendance?.scheduled_time?.slice(0, 5) ?? '06:00')
  }

  function handleRescheduleConfirm() {
    if (!attendance || !newDate) return
    setAction('reschedule')
    setError(null)
    startTransition(async () => {
      const result = await rescheduleSession(attendance.id, newDate, newTime)
      if (result.error) {
        setError(result.error)
        setAction(null)
      } else {
        setAction(null)
        handleClose()
      }
    })
  }

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) handleClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-3 p-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">
              {showReschedule ? 'Reschedule Session' : 'Mark Attendance'}
            </span>
            <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-600">
              <Cancel01Icon size={24} color="currentColor" />
            </button>
          </div>

          <div className="h-px bg-neutral-200" />

          {/* Client Info */}
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium text-neutral-950">
              {attendance?.clients?.name}
            </span>
            <div className="flex items-center gap-2">
              <Calendar01Icon size={18} color="currentColor" className="text-neutral-400 shrink-0" />
              <span className="text-[15px] font-normal text-neutral-500">
                {attendance
                  ? formatSessionDateTime(attendance.scheduled_date, attendance.scheduled_time)
                  : ''}
              </span>
            </div>
          </div>

          <div className="h-3" />

          {/* Reschedule Form */}
          {showReschedule ? (
            <>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[13px] font-normal text-neutral-500">New Date</span>
                  <input
                    type="date"
                    value={newDate}
                    min={todayLocal()}
                    onChange={e => setNewDate(e.target.value)}
                    className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[13px] font-normal text-neutral-500">New Time</span>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800"
                  />
                </label>
              </div>

              {error && (
                <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
              )}

              <button
                onClick={handleRescheduleConfirm}
                disabled={isPending || !newDate}
                className="flex h-[52px] w-full items-center justify-center rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
              >
                {action === 'reschedule' ? 'Rescheduling…' : 'Confirm Reschedule'}
              </button>

              <button
                onClick={() => setShowReschedule(false)}
                disabled={isPending}
                className="flex h-11 w-full items-center justify-center text-[15px] font-normal text-neutral-400"
              >
                Back
              </button>
            </>
          ) : (
            <>
              {/* Start Session */}
              <button
                onClick={onStartSession}
                disabled={isPending}
                className="flex h-[52px] w-full items-center justify-center rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
              >
                Start Session
              </button>

              {/* Mark as Absent */}
              <button
                onClick={handleMarkAbsent}
                disabled={isPending}
                className="flex h-[52px] w-full items-center justify-center rounded-base border-[1.5px] border-danger-600 text-base font-normal text-danger-600 disabled:opacity-50"
              >
                {action === 'absent' ? 'Marking…' : 'Mark as Absent'}
              </button>

              {/* Reschedule */}
              <button
                onClick={handleRescheduleOpen}
                disabled={isPending}
                className="flex h-12 w-full items-center justify-center text-base font-normal text-neutral-950 disabled:opacity-50"
              >
                Reschedule
              </button>

              {/* Cancel */}
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex h-11 w-full items-center justify-center text-[15px] font-normal text-neutral-400"
              >
                Cancel
              </button>
            </>
          )}

        </div>
      </BottomDrawerContent>
    </BottomDrawer>
  )
}
