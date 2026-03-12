'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft01Icon,
  MoreVerticalIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react'
import type {
  ClientDetail,
  AttendanceHistoryRow,
  PaymentStatus,
  ClientWorkout,
} from '@/actions/clients'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCHEDULE_LABELS: Record<string, string> = {
  sunday: 'Sun Set',
  saturday: 'Sat Set',
  custom: 'Custom',
}

function formatPrograms(programs: string[] | null): string {
  if (!programs || programs.length === 0) return 'No programs'
  return programs.join(' · ')
}

function lastSessionAgo(attendance: AttendanceHistoryRow[]): string {
  const last = attendance.find(r => r.status === 'attended')
  if (!last) return 'No sessions yet'
  const [y, m, d] = last.scheduled_date.split('-').map(Number)
  const sessionDate = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000)
  if (diffDays === 0) return 'Last session: today'
  if (diffDays === 1) return 'Last session: yesterday'
  return `Last session: ${diffDays} days ago`
}

function formatPaymentDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ─── Attendance Dot Grid ─────────────────────────────────────────────────────

function AttendanceDotGrid({ attendance }: { attendance: AttendanceHistoryRow[] }) {
  const recent = attendance.slice(0, 14).reverse()
  const row1 = recent.slice(0, 7)
  const row2 = recent.slice(7, 14)

  function dotColor(status: string | null): string {
    if (status === 'attended') return 'bg-success-600'
    if (status === 'missed') return 'bg-danger-600'
    return 'bg-neutral-300'
  }

  return (
    <div className="flex flex-col gap-3 rounded-base bg-white border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-neutral-950">Last 2 Weeks Attendance</span>
        <span className="text-[13px] font-medium text-neutral-950">View Full</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-center gap-2">
          {row1.map((r, i) => (
            <div key={i} className={`h-3.5 w-3.5 rounded-full ${dotColor(r.status)}`} />
          ))}
          {Array.from({ length: Math.max(0, 7 - row1.length) }).map((_, i) => (
            <div key={`p1-${i}`} className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
          ))}
        </div>
        <div className="flex justify-center gap-2">
          {row2.map((r, i) => (
            <div key={i} className={`h-3.5 w-3.5 rounded-full ${dotColor(r.status)}`} />
          ))}
          {Array.from({ length: Math.max(0, 7 - row2.length) }).map((_, i) => (
            <div key={`p2-${i}`} className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success-600" />
          <span className="text-[12px] font-normal text-neutral-500">Attended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-danger-600" />
          <span className="text-[12px] font-normal text-neutral-500">Missed</span>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  client: ClientDetail
  attendance: AttendanceHistoryRow[]
  payment: PaymentStatus
  workouts: ClientWorkout[]
}

export function ClientDetailView({ client, attendance, payment, workouts }: Props) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 self-start"
        >
          <ArrowLeft01Icon size={18} color="currentColor" className="text-neutral-500" />
          <span className="text-[13px] font-normal text-neutral-500">Back to Clients</span>
        </button>

        {/* Name + menu */}
        <div className="flex items-center justify-between -mt-2">
          <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
            {client.name}
          </h1>
          <MoreVerticalIcon size={22} color="currentColor" className="text-neutral-500" />
        </div>

        {/* Programs */}
        <span className="text-[14px] font-normal text-neutral-500 -mt-3">
          {formatPrograms(client.training_programs)}
        </span>

        {/* Meta row: badge + last session */}
        <div className="flex items-center gap-3 -mt-2">
          <span className="rounded-base bg-neutral-200 px-2 py-1 text-[12px] font-medium text-neutral-950">
            {SCHEDULE_LABELS[client.schedule_set] ?? client.schedule_set}
          </span>
          <span className="text-[13px] font-normal text-neutral-500">
            {lastSessionAgo(attendance)}
          </span>
        </div>

        {/* Payment Status Card */}
        {payment.lastPaymentDate ? (
          <div className={`flex items-center justify-between rounded-base p-4 ${
            payment.isOverdue ? 'bg-amber-50' : 'bg-green-50'
          }`}>
            <div className="flex flex-col gap-1">
              <span className={`text-[12px] font-medium ${
                payment.isOverdue ? 'text-amber-700' : 'text-green-700'
              }`}>
                Payment Status
              </span>
              <span className="text-[14px] font-medium text-neutral-950">
                {payment.isOverdue
                  ? `Overdue — ${formatPaymentDate(payment.validUntil)}`
                  : `Paid — Valid until ${formatPaymentDate(payment.validUntil)}`
                }
              </span>
            </div>
            <span className={`text-base font-medium ${
              payment.isOverdue ? 'text-amber-700' : 'text-green-700'
            }`}>
              {payment.currency} {payment.amount?.toFixed(2)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-base bg-neutral-200/50 p-4">
            <span className="text-[13px] font-normal text-neutral-400">No payment records</span>
          </div>
        )}

        {/* Progress Stats */}
        {(client.current_height || client.current_weight || client.current_fat_percent) && (
          <div className="flex flex-col gap-3">
            <span className="text-xl font-medium text-neutral-950">Progress Stats</span>
            <div className="flex gap-2">
              {client.current_height != null && (
                <div className="flex flex-1 flex-col gap-1 rounded-base bg-white border border-neutral-200 p-4">
                  <span className="text-[28px] font-medium text-neutral-950 leading-none">
                    {client.current_height}
                  </span>
                  <span className="text-[12px] font-normal text-neutral-500">cm</span>
                  <span className="text-[12px] font-medium text-neutral-500">Height</span>
                </div>
              )}
              {client.current_weight != null && (
                <div className="flex flex-1 flex-col gap-1 rounded-base bg-white border border-neutral-200 p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[28px] font-medium text-neutral-950 leading-none">
                      {client.current_weight}
                    </span>
                    <ArrowDown01Icon size={16} color="currentColor" className="text-success-600" />
                  </div>
                  <span className="text-[12px] font-normal text-neutral-500">kg</span>
                  <span className="text-[12px] font-medium text-neutral-500">Weight</span>
                </div>
              )}
              {client.current_fat_percent != null && (
                <div className="flex flex-1 flex-col gap-1 rounded-base bg-white border border-neutral-200 p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[28px] font-medium text-neutral-950 leading-none">
                      {client.current_fat_percent}
                    </span>
                    <ArrowDown01Icon size={16} color="currentColor" className="text-success-600" />
                  </div>
                  <span className="text-[12px] font-normal text-neutral-500">%</span>
                  <span className="text-[12px] font-medium text-neutral-500">Body Fat</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Dot Grid */}
        {attendance.length > 0 && (
          <AttendanceDotGrid attendance={attendance} />
        )}

        {/* Workout Routine */}
        {workouts.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xl font-medium text-neutral-950">Workout Routine</span>
            {workouts.map(workout => (
              <div
                key={workout.id}
                className="flex flex-col gap-2.5 rounded-base bg-white border border-neutral-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-neutral-950">{workout.name}</span>
                  <ArrowRight01Icon size={18} color="currentColor" className="text-neutral-500" />
                </div>
                <span className="text-[13px] font-normal text-neutral-500">
                  {workout.exercises.length} exercises
                </span>
                {workout.exercises.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {workout.exercises.slice(0, 3).map((ex, i) => (
                      <span key={i} className="text-[13px] font-normal text-neutral-500">
                        {ex.name} — {ex.sets > 0 ? `${ex.sets} sets` : 'No sets'}
                      </span>
                    ))}
                    {workout.exercises.length > 3 && (
                      <span className="text-[13px] font-medium text-neutral-950">
                        +{workout.exercises.length - 3} more exercises
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
