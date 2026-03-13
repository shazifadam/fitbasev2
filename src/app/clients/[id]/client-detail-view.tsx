'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  MoreVerticalIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  MinusSignIcon,
  Money01Icon,
  ChartLineData01Icon,
  PencilEdit01Icon,
  Clock01Icon,
  UserRemove01Icon,
  Delete01Icon,
  Add01Icon,
} from '@/components/ui/icon'
import type { ProgressTrend } from '@/actions/progress'
import { RecordPaymentDrawer } from '@/components/payments/record-payment-drawer'
import { deactivateClient, deleteClient } from '@/actions/clients'
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

// ─── Dropdown Menu ──────────────────────────────────────────────────────────

function ClientMenu({
  onEditClient,
  onRecordPayment,
  onRecordProgress,
  onDeactivate,
  onDelete,
}: {
  onEditClient: () => void
  onRecordPayment: () => void
  onRecordProgress: () => void
  onDeactivate: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(prev => !prev)} className="p-1">
        <HugeiconsIcon icon={MoreVerticalIcon} size={22} color="currentColor" className="text-neutral-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-base border border-neutral-200 bg-white shadow-lg py-2 min-w-[200px]">
          <button
            onClick={() => { setOpen(false); onEditClient() }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-[14px] font-normal text-neutral-950 text-left"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={18} color="currentColor" className="text-neutral-500" />
            Edit Client
          </button>
          <button
            onClick={() => { setOpen(false); onRecordPayment() }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-[14px] font-normal text-neutral-950 text-left"
          >
            <HugeiconsIcon icon={Money01Icon} size={18} color="currentColor" className="text-neutral-500" />
            Record Payment
          </button>
          <button
            onClick={() => { setOpen(false); onRecordProgress() }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-[14px] font-normal text-neutral-950 text-left"
          >
            <HugeiconsIcon icon={ChartLineData01Icon} size={18} color="currentColor" className="text-neutral-500" />
            Record Progress
          </button>
          <button
            onClick={() => { setOpen(false); onDeactivate() }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-[14px] font-normal text-neutral-950 text-left"
          >
            <HugeiconsIcon icon={UserRemove01Icon} size={18} color="currentColor" className="text-neutral-500" />
            Deactivate Client
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-[14px] font-normal text-danger-600 text-left"
          >
            <HugeiconsIcon icon={Delete01Icon} size={18} color="currentColor" className="text-danger-600" />
            Delete Client
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Attendance Dot Grid ─────────────────────────────────────────────────────

function AttendanceDotGrid({ attendance, clientId }: { attendance: AttendanceHistoryRow[]; clientId: string }) {
  const router = useRouter()
  const recent = attendance.slice(0, 14).reverse()
  const row1 = recent.slice(0, 7)
  const row2 = recent.slice(7, 14)

  function dotStyle(status: string | null): string {
    if (status === 'attended') return 'bg-[#16a34a]'
    if (status === 'missed') return 'bg-[#db5625]'
    if (status === 'rescheduled') return 'border-[1.5px] border-amber-500'
    return 'bg-neutral-300'
  }

  return (
    <div className="flex flex-col gap-3 rounded-base bg-white border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-neutral-950">Last 2 Weeks Attendance</span>
        <button onClick={() => router.push(`/clients/${clientId}/attendance`)} className="text-[13px] font-medium text-neutral-950">View Full</button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-center gap-2">
          {row1.map((r, i) => (
            <div key={i} className={`h-3.5 w-3.5 rounded-full ${dotStyle(r.status)}`} />
          ))}
          {Array.from({ length: Math.max(0, 7 - row1.length) }).map((_, i) => (
            <div key={`p1-${i}`} className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
          ))}
        </div>
        <div className="flex justify-center gap-2">
          {row2.map((r, i) => (
            <div key={i} className={`h-3.5 w-3.5 rounded-full ${dotStyle(r.status)}`} />
          ))}
          {Array.from({ length: Math.max(0, 7 - row2.length) }).map((_, i) => (
            <div key={`p2-${i}`} className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
          <span className="text-[12px] font-normal text-neutral-500">Attended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#db5625]" />
          <span className="text-[12px] font-normal text-neutral-500">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-amber-500" />
          <span className="text-[12px] font-normal text-neutral-500">Rescheduled</span>
        </div>
      </div>
    </div>
  )
}

// ─── Payment Card ───────────────────────────────────────────────────────────

function PaymentCard({ payment, clientId }: { payment: PaymentStatus; clientId: string }) {
  const router = useRouter()

  // No payment records at all
  if (!payment.lastPaymentDate) {
    return (
      <button
        onClick={() => router.push(`/clients/${clientId}/payments`)}
        className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4 w-full text-left"
      >
        <span className="text-[13px] font-normal text-neutral-400">No payment records</span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" className="text-neutral-400" />
      </button>
    )
  }

  const isOverdue = payment.isOverdue

  return (
    <button
      onClick={() => router.push(`/clients/${clientId}/payments`)}
      className="flex rounded-base bg-white border border-neutral-200 overflow-hidden w-full text-left"
    >
      {/* Orange accent bar for overdue */}
      {isOverdue && (
        <div className="w-1 shrink-0 bg-amber-600 rounded-l-base" />
      )}
      {/* Green accent bar for paid */}
      {!isOverdue && (
        <div className="w-1 shrink-0 bg-success-600 rounded-l-base" />
      )}

      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Row 1: label + amount */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-normal text-neutral-400">Payment Status</span>
          <span className="text-[18px] font-medium text-neutral-950">
            {payment.currency} {payment.amount?.toFixed(2)}
          </span>
        </div>

        {/* Row 2: status text + pill */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-normal text-neutral-500">
            {isOverdue
              ? `Overdue — ${formatPaymentDate(payment.validUntil)}`
              : `Paid — Valid until ${formatPaymentDate(payment.validUntil)}`
            }
          </span>
          {isOverdue ? (
            <span className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-[12px] font-normal text-amber-700">
              Unpaid
            </span>
          ) : (
            <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-[12px] font-normal text-green-700">
              Paid
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200" />

        {/* View Payment History link */}
        <div className="flex items-center justify-center gap-1.5">
          <HugeiconsIcon icon={Clock01Icon} size={14} color="currentColor" className="text-neutral-400" />
          <span className="text-[13px] font-normal text-neutral-400">View Payment History</span>
        </div>
      </div>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Trend Icon Helper ──────────────────────────────────────────────────────

function TrendIcon({ direction, invertColor }: { direction: 'up' | 'down' | 'same' | null; invertColor?: boolean }) {
  if (!direction || direction === 'same') {
    return <HugeiconsIcon icon={MinusSignIcon} size={16} color="currentColor" className="text-neutral-400" />
  }
  // For weight/body fat: down = good (green), up = bad (red)
  // For height: up = good (green), down = neutral
  const isGood = invertColor ? direction === 'up' : direction === 'down'
  const colorClass = isGood ? 'text-success-600' : 'text-danger-600'

  if (direction === 'up') {
    return <HugeiconsIcon icon={ArrowUp01Icon} size={16} color="currentColor" className={colorClass} />
  }
  return <HugeiconsIcon icon={ArrowDown01Icon} size={16} color="currentColor" className={colorClass} />
}

type Props = {
  client: ClientDetail
  attendance: AttendanceHistoryRow[]
  payment: PaymentStatus
  workouts: ClientWorkout[]
  tierAmount: number | null
  progressTrend: ProgressTrend
}

export function ClientDetailView({ client, attendance, payment, workouts, tierAmount, progressTrend }: Props) {
  const router = useRouter()
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false)

  function handleDeactivate() {
    if (!confirm('Deactivate this client? They will be hidden from the dashboard.')) return
    void (async () => {
      const result = await deactivateClient(client.id)
      if (!result.error) {
        router.push('/clients')
      }
    })()
  }

  function handleDelete() {
    if (!confirm('Permanently delete this client and all their data? This cannot be undone.')) return
    void (async () => {
      const result = await deleteClient(client.id)
      if (!result.error) {
        router.push('/clients')
      }
    })()
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">

      {/* ── White top section: client info ── */}
      <div className="bg-white flex flex-col gap-2.5 px-4 pt-6 pb-6">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 self-start -ml-2 px-2 py-2 rounded-base active:bg-neutral-100"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="currentColor" className="text-neutral-500" />
          <span className="text-[13px] font-normal text-neutral-500">Back to Clients</span>
        </button>

        {/* Name + menu */}
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
            {client.name}
          </h1>
          <ClientMenu
            onEditClient={() => router.push(`/clients/${client.id}/edit`)}
            onRecordPayment={() => setShowPaymentDrawer(true)}
            onRecordProgress={() => router.push(`/progress/record/${client.id}`)}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />
        </div>

        {/* Programs */}
        <span className="text-[14px] font-normal text-neutral-500">
          {formatPrograms(client.training_programs)}
        </span>

        {/* Meta row: badge + last session */}
        <div className="flex items-center gap-3">
          <span className="rounded-base bg-neutral-100 px-2 py-1 text-[12px] font-medium text-neutral-950">
            {SCHEDULE_LABELS[client.schedule_set] ?? client.schedule_set}
          </span>
          <span className="text-[13px] font-normal text-neutral-500">
            {lastSessionAgo(attendance)}
          </span>
        </div>
      </div>

      {/* ── Content section: grey background ── */}
      <div className="flex flex-col gap-6 px-4 pt-4 pb-6">

        {/* Payment Status Card — shown at TOP if overdue */}
        {payment.isOverdue && <PaymentCard payment={payment} clientId={client.id} />}

        {/* Progress Stats */}
        {(client.current_height || client.current_weight || client.current_fat_percent) && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-neutral-950">Progress Stats</span>
              <button onClick={() => router.push(`/clients/${client.id}/progress`)} className="text-[13px] font-medium text-neutral-950">View Full</button>
            </div>
            <div className="flex gap-2">
              {client.current_height != null && (
                <div className="flex flex-1 flex-col gap-1 rounded-base bg-white border border-neutral-200 p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[28px] font-medium text-neutral-950 leading-none">
                      {client.current_height}
                    </span>
                    <TrendIcon direction={progressTrend.height} invertColor />
                  </div>
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
                    <TrendIcon direction={progressTrend.weight} />
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
                    <TrendIcon direction={progressTrend.fat_percent} />
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
          <AttendanceDotGrid attendance={attendance} clientId={client.id} />
        )}

        {/* Payment Status Card — shown LOWER if not overdue */}
        {!payment.isOverdue && <PaymentCard payment={payment} clientId={client.id} />}

        {/* Workout Routine */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Workout Routine</span>
            <button
              onClick={() => router.push(`/workouts/create?client_id=${client.id}`)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-950"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} color="currentColor" />
              Add
            </button>
          </div>
          {workouts.length === 0 && (
            <div className="flex items-center justify-center rounded-base border border-neutral-200 bg-white py-8">
              <span className="text-[14px] font-normal text-neutral-400">No workouts yet</span>
            </div>
          )}
          {workouts.map(workout => (
            <button
              key={workout.id}
              onClick={() => router.push(`/workouts/${workout.id}`)}
              className="flex flex-col gap-2.5 rounded-base bg-white border border-neutral-200 p-4 w-full text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-neutral-950">{workout.name}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="currentColor" className="text-neutral-500" />
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
            </button>
          ))}
        </div>

      </div>

      {/* Record Payment Drawer */}
      <RecordPaymentDrawer
        open={showPaymentDrawer}
        onClose={() => setShowPaymentDrawer(false)}
        clientId={client.id}
        tierAmount={tierAmount}
        currency={payment.currency}
      />
    </main>
  )
}
