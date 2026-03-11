'use client'

import { useState } from 'react'
import { DragDropVerticalIcon, CheckmarkCircle01Icon, CancelCircleIcon } from 'hugeicons-react'
import type { AttendanceWithClient } from '@/actions/dashboard'
import { SessionActionDrawer } from '@/components/dashboard/session-action-drawer'
import { SelectWorkoutDrawer } from '@/components/dashboard/select-workout-drawer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
  return time.slice(0, 5) // "07:00:00" → "07:00"
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
  const [selectedItem, setSelectedItem] = useState<AttendanceWithClient | null>(null)
  const [showWorkoutDrawer, setShowWorkoutDrawer] = useState(false)

  const attending = attendance.filter(a => a.status === 'attending')
  // Only show 'scheduled' in the time groups — 'attending' moves to /attending page
  const scheduled = attendance.filter(a => a.status === 'scheduled')
  const attended = attendance.filter(a => a.status === 'attended')
  const absent = attendance.filter(a => a.status === 'missed')

  // Group scheduled by time
  const byTime = scheduled.reduce<Record<string, AttendanceWithClient[]>>(
    (acc, item) => {
      const time = formatTime(item.scheduled_time)
      if (!acc[time]) acc[time] = []
      acc[time].push(item)
      return acc
    },
    {}
  )
  const timeGroups = Object.entries(byTime).sort(([a], [b]) => a.localeCompare(b))

  const initials = getInitials(trainerName)

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

        {/* Date Display — always today */}
        <div className="flex items-center h-12 px-4 bg-white rounded-base border border-neutral-200">
          <span className="text-[15px] font-medium text-neutral-950">
            {formatDateLabel(date)}
          </span>
        </div>

        {/* Summary Banner */}
        <div className="flex items-center justify-between rounded-base bg-neutral-800 px-4 py-4">
          <span className="text-[15px] font-medium text-white">Attending</span>
          <div className="flex items-center justify-center rounded-full bg-white/[0.13] px-[14px] py-[6px]">
            <span className="text-[13px] font-medium text-white">
              {attending.length} attending
            </span>
          </div>
        </div>

        {/* Time Groups — scheduled only */}
        {timeGroups.map(([time, clients]) => (
          <div key={time} className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-neutral-500">{time}</span>
            {clients.map(item => (
              <button
                key={item.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4 w-full text-left"
                onClick={() => setSelectedItem(item)}
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
        onClose={() => setSelectedItem(null)}
        onStartSession={() => setShowWorkoutDrawer(true)}
      />

      {/* Select Workout Drawer */}
      <SelectWorkoutDrawer
        open={showWorkoutDrawer}
        attendance={selectedItem}
        onClose={() => {
          setShowWorkoutDrawer(false)
          setSelectedItem(null)
        }}
      />

    </main>
  )
}
