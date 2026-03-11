'use client'

import { useState, useTransition } from 'react'
import { Calendar, X } from 'lucide-react'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { markAbsent } from '@/actions/session'
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

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  attendance: AttendanceWithClient | null
  onClose: () => void
  onStartSession: () => void
}

export function SessionActionDrawer({ open, attendance, onClose, onStartSession }: Props) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'absent' | null>(null)

  function handleMarkAbsent() {
    if (!attendance) return
    setAction('absent')
    startTransition(async () => {
      await markAbsent(attendance.id)
      setAction(null)
      onClose()
    })
  }

  return (
    <BottomDrawer open={open} onOpenChange={open => { if (!open) onClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-3 p-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Mark Attendance</span>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <X size={24} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200" />

          {/* Client Info */}
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium text-neutral-950">
              {attendance?.clients?.name}
            </span>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-neutral-400 shrink-0" />
              <span className="text-[15px] font-normal text-neutral-500">
                {attendance
                  ? formatSessionDateTime(attendance.scheduled_date, attendance.scheduled_time)
                  : ''}
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-3" />

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
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center text-base font-normal text-neutral-950 disabled:opacity-50"
          >
            Reschedule
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex h-11 w-full items-center justify-center text-[15px] font-normal text-neutral-400"
          >
            Cancel
          </button>

        </div>
      </BottomDrawerContent>
    </BottomDrawer>
  )
}
