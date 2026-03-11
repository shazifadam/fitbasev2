'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Accordion from '@radix-ui/react-accordion'
import { ArrowDown01Icon, CheckmarkCircle01Icon } from 'hugeicons-react'
import {
  completeSession,
  type AttendingSession,
  type ExerciseEntry,
  type ExerciseWeights,
  type SetEntry,
} from '@/actions/attending'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatStartedTime(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function initWeights(session: AttendingSession): ExerciseWeights {
  if (session.exercise_weights?.exercises?.length) {
    return session.exercise_weights
  }
  const wes = session.workouts?.workout_exercises
  if (wes?.length) {
    const exercises: ExerciseEntry[] = wes
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .filter(we => we.exercises)
      .map(we => ({
        exercise_id: we.exercises!.id,
        exercise_name: we.exercises!.name,
        sets: (we.sets ?? []).map((s: SetEntry) => ({
          set_number: s.set_number,
          weight_kg: s.weight_kg ?? null,
          reps: s.reps ?? null,
          completed: false,
        })),
      }))
    return { exercises }
  }
  return { exercises: [] }
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  sessions: AttendingSession[]
  trainerName: string
}

export function AttendingView({ sessions, trainerName }: Props) {
  const router = useRouter()

  // weights[attendanceId] = mutable ExerciseWeights state
  const [weights, setWeights] = useState<Record<string, ExerciseWeights>>(() =>
    Object.fromEntries(sessions.map(s => [s.id, initWeights(s)]))
  )

  const initials = getInitials(trainerName)

  function updateSet(
    sessionId: string,
    exIdx: number,
    setIdx: number,
    field: 'weight_kg' | 'reps' | 'completed',
    value: number | boolean | null,
  ) {
    setWeights(prev => {
      const copy = JSON.parse(JSON.stringify(prev)) as typeof prev
      const set = copy[sessionId].exercises[exIdx].sets[setIdx]
      if (field === 'completed') set.completed = value as boolean
      else set[field] = value as number | null
      return copy
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-neutral-500">Active Sessions</span>
            <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
              Attending
            </h1>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white text-base font-medium">
            {initials}
          </div>
        </div>

        {/* Empty state */}
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-[15px] font-normal text-neutral-400">
              No active sessions right now
            </span>
          </div>
        )}

        {/* Accordion */}
        {sessions.length > 0 && (
          <Accordion.Root type="single" collapsible className="flex flex-col gap-2">
            {sessions.map(session => (
              <SessionItem
                key={session.id}
                session={session}
                sessionWeights={weights[session.id] ?? { exercises: [] }}
                onUpdateSet={(exIdx, setIdx, field, value) =>
                  updateSet(session.id, exIdx, setIdx, field, value)
                }
                onComplete={() => router.refresh()}
              />
            ))}
          </Accordion.Root>
        )}

      </div>
    </main>
  )
}

// ─── Session Item ─────────────────────────────────────────────────────────────

type SessionItemProps = {
  session: AttendingSession
  sessionWeights: ExerciseWeights
  onUpdateSet: (
    exIdx: number,
    setIdx: number,
    field: 'weight_kg' | 'reps' | 'completed',
    value: number | boolean | null,
  ) => void
  onComplete: () => void
}

function SessionItem({ session, sessionWeights, onUpdateSet, onComplete }: SessionItemProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const clientName = session.clients?.name ?? 'Unknown'
  const workoutName = session.workouts?.name
  const hasExercises = sessionWeights.exercises.length > 0

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const result = await completeSession(session.id, sessionWeights)
      if (result.error) setError(result.error)
      else onComplete()
    })
  }

  return (
    <Accordion.Item
      value={session.id}
      className="rounded-card bg-white border border-neutral-200 overflow-hidden"
    >
      {/* Trigger */}
      <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-4 text-left group">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium text-neutral-950">{clientName}</span>
          <span className="text-[13px] font-normal text-neutral-500">
            Started {formatStartedTime(session.session_started_at)}
            {workoutName ? ` · ${workoutName}` : ''}
          </span>
        </div>
        <ArrowDown01Icon
          size={20}
          color="currentColor"
          className="text-neutral-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </Accordion.Trigger>

      {/* Content */}
      <Accordion.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
        <div className="flex flex-col gap-4 px-4 pb-5 border-t border-neutral-100">

          {/* No workout / no exercises */}
          {!hasExercises && (
            <p className="pt-4 text-[14px] font-normal text-neutral-400 text-center">
              {workoutName ? 'No exercises in this workout' : 'No workout selected for this session'}
            </p>
          )}

          {/* Exercises */}
          {sessionWeights.exercises.map((ex, exIdx) => (
            <div key={ex.exercise_id} className="flex flex-col gap-2 pt-4">
              <span className="text-[14px] font-medium text-neutral-950">{ex.exercise_name}</span>

              {/* Set rows */}
              <div className="flex flex-col gap-1">
                {/* Column headers */}
                <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 px-1">
                  <span className="text-[11px] font-normal text-neutral-400 text-center">Set</span>
                  <span className="text-[11px] font-normal text-neutral-400 text-center">kg</span>
                  <span className="text-[11px] font-normal text-neutral-400 text-center">Reps</span>
                  <span className="text-[11px] font-normal text-neutral-400 text-center">✓</span>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div
                    key={set.set_number}
                    className={cn(
                      'grid grid-cols-[32px_1fr_1fr_32px] gap-2 items-center rounded-base px-1 py-1',
                      set.completed ? 'bg-neutral-50' : ''
                    )}
                  >
                    {/* Set number */}
                    <span className="text-[13px] font-normal text-neutral-500 text-center">
                      {set.set_number}
                    </span>

                    {/* Weight */}
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="—"
                      value={set.weight_kg ?? ''}
                      onChange={e =>
                        onUpdateSet(exIdx, setIdx, 'weight_kg',
                          e.target.value === '' ? null : parseFloat(e.target.value))
                      }
                      className="h-9 rounded-base border border-neutral-200 px-2 text-center text-[13px] font-normal text-neutral-950 outline-none focus:border-neutral-800 bg-white"
                    />

                    {/* Reps */}
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="—"
                      value={set.reps ?? ''}
                      onChange={e =>
                        onUpdateSet(exIdx, setIdx, 'reps',
                          e.target.value === '' ? null : parseInt(e.target.value, 10))
                      }
                      className="h-9 rounded-base border border-neutral-200 px-2 text-center text-[13px] font-normal text-neutral-950 outline-none focus:border-neutral-800 bg-white"
                    />

                    {/* Completed toggle */}
                    <button
                      type="button"
                      onClick={() => onUpdateSet(exIdx, setIdx, 'completed', !set.completed)}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full mx-auto transition-colors',
                        set.completed
                          ? 'bg-neutral-800'
                          : 'border-[1.5px] border-neutral-300'
                      )}
                    >
                      {set.completed && (
                        <CheckmarkCircle01Icon size={14} color="white" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Error */}
          {error && (
            <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
          )}

          {/* Complete Session */}
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center rounded-base bg-neutral-800 text-[15px] font-normal text-white disabled:opacity-50 mt-2"
          >
            {isPending ? 'Completing…' : 'Complete Session'}
          </button>

        </div>
      </Accordion.Content>
    </Accordion.Item>
  )
}
