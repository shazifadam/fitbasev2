'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft01Icon,
  CallIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Clock01Icon,
} from 'hugeicons-react'
import type { ClientDetail, AttendanceHistoryRow } from '@/actions/clients'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCHEDULE_LABELS: Record<string, string> = {
  sunday: 'Sun Set',
  saturday: 'Sat Set',
  custom: 'Custom',
}

const SCHEDULE_DAYS: Record<string, string[]> = {
  sunday: ['Sun', 'Tue', 'Thu'],
  saturday: ['Sat', 'Mon', 'Wed'],
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatPrograms(programs: string[] | null): string {
  if (!programs || programs.length === 0) return 'No programs'
  return programs.join(' · ')
}

function statusIcon(status: string | null) {
  if (status === 'attended')
    return <CheckmarkCircle01Icon size={16} color="currentColor" className="text-success-600" />
  if (status === 'missed')
    return <CancelCircleIcon size={16} color="currentColor" className="text-danger-600" />
  if (status === 'attending')
    return <Clock01Icon size={16} color="currentColor" className="text-warning-500" />
  return <Clock01Icon size={16} color="currentColor" className="text-neutral-400" />
}

function statusLabel(status: string | null): string {
  if (status === 'attended') return 'Attended'
  if (status === 'missed') return 'Absent'
  if (status === 'attending') return 'In Session'
  if (status === 'rescheduled') return 'Rescheduled'
  return 'Scheduled'
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  client: ClientDetail
  attendance: AttendanceHistoryRow[]
}

export function ClientDetailView({ client, attendance }: Props) {
  const router = useRouter()

  const days =
    client.schedule_set === 'custom'
      ? client.custom_days ?? []
      : SCHEDULE_DAYS[client.schedule_set] ?? []

  const sessionTimes = (client.session_times ?? {}) as Record<string, string>

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header with back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-base bg-white border border-neutral-200"
          >
            <ArrowLeft01Icon size={20} color="currentColor" className="text-neutral-950" />
          </button>
          <h1 className="text-[22px] font-medium text-neutral-950 leading-tight">
            {client.name}
          </h1>
        </div>

        {/* Info Card */}
        <div className="flex flex-col gap-4 rounded-card bg-white border border-neutral-200 p-4">
          {/* Programs */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Programs</span>
            <span className="text-[15px] font-normal text-neutral-950">
              {formatPrograms(client.training_programs)}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <CallIcon size={16} color="currentColor" className="text-neutral-400" />
            <span className="text-[15px] font-normal text-neutral-950">{client.phone}</span>
          </div>

          {/* Tier */}
          {client.tiers && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Tier</span>
              <span className="rounded-base bg-neutral-100 px-2 py-1 text-[13px] font-normal text-neutral-600 self-start">
                {client.tiers.name}
              </span>
            </div>
          )}
        </div>

        {/* Schedule Card */}
        <div className="flex flex-col gap-4 rounded-card bg-white border border-neutral-200 p-4">
          <div className="flex items-center gap-2">
            <Calendar01Icon size={16} color="currentColor" className="text-neutral-400" />
            <span className="text-[14px] font-medium text-neutral-950">
              Schedule — {SCHEDULE_LABELS[client.schedule_set] ?? client.schedule_set}
            </span>
          </div>

          {days.length > 0 ? (
            <div className="flex flex-col gap-2">
              {days.map(day => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-[14px] font-normal text-neutral-950">{day}</span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {sessionTimes[day] ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[13px] font-normal text-neutral-400">No days configured</span>
          )}
        </div>

        {/* Body Metrics (if any) */}
        {(client.current_weight || client.current_height) && (
          <div className="flex flex-col gap-3 rounded-card bg-white border border-neutral-200 p-4">
            <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Body Metrics</span>
            <div className="grid grid-cols-2 gap-3">
              {client.current_weight && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-normal text-neutral-400">Weight</span>
                  <span className="text-[15px] font-normal text-neutral-950">{client.current_weight} kg</span>
                </div>
              )}
              {client.current_height && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-normal text-neutral-400">Height</span>
                  <span className="text-[15px] font-normal text-neutral-950">{client.current_height} cm</span>
                </div>
              )}
              {client.current_fat_percent && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-normal text-neutral-400">Body Fat</span>
                  <span className="text-[15px] font-normal text-neutral-950">{client.current_fat_percent}%</span>
                </div>
              )}
              {client.current_waist && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-normal text-neutral-400">Waist</span>
                  <span className="text-[15px] font-normal text-neutral-950">{client.current_waist} cm</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance History */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-neutral-950">Attendance History</span>
            <span className="text-[13px] font-normal text-neutral-500">
              Last {attendance.length} sessions
            </span>
          </div>

          {attendance.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-[14px] font-normal text-neutral-400">No attendance records yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {attendance.map(row => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-base bg-white border border-neutral-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(row.status)}
                    <div className="flex flex-col">
                      <span className="text-[14px] font-normal text-neutral-950">
                        {formatDate(row.scheduled_date)}
                      </span>
                      <span className="text-[12px] font-normal text-neutral-400">
                        {row.scheduled_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {statusLabel(row.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
