'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { HugeiconsIcon, Cancel01Icon, PlayIcon, Tick01Icon } from '@/components/ui/icon'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { getTrainerWorkouts, type WorkoutSummary } from '@/actions/workouts'
import { startSession } from '@/actions/session'
import { Spinner } from '@/components/ui/spinner'
import type { AttendanceWithClient } from '@/actions/dashboard'

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  attendance: AttendanceWithClient | null
  onClose: () => void
}

export function SelectWorkoutDrawer({ open, attendance, onClose }: Props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Fetch workouts when drawer opens
  useEffect(() => {
    if (open) {
      getTrainerWorkouts().then(setWorkouts)
      setSelectedWorkoutId(null)
    }
  }, [open])

  function handleStartSession() {
    if (!attendance) return
    startTransition(async () => {
      await startSession(attendance.id, selectedWorkoutId)
      onClose()
      mutate((key: unknown) => Array.isArray(key) && (key[0] === 'attendance' || key[0] === 'attending-sessions'))
      router.refresh()
    })
  }

  const clientFirstName = attendance?.clients?.name?.split(' ')[0] ?? 'client'

  return (
    <BottomDrawer open={open} onOpenChange={open => { if (!open) onClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-3 p-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Select Workout</span>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="currentColor" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200" />

          {/* Subtitle */}
          <span className="text-[15px] font-normal text-neutral-500">
            Choose a workout for {clientFirstName}&apos;s session
          </span>

          <div className="h-1" />

          {/* Workout List */}
          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto no-scrollbar">
            {workouts.length === 0 && (
              <span className="text-[15px] font-normal text-neutral-400 text-center py-4">
                No workouts yet
              </span>
            )}
            {workouts.map(workout => {
              const isSelected = selectedWorkoutId === workout.id
              return (
                <button
                  key={workout.id}
                  onClick={() => setSelectedWorkoutId(isSelected ? null : workout.id)}
                  className={[
                    'flex items-center justify-between rounded-base p-4 w-full text-left',
                    isSelected
                      ? 'border-2 border-neutral-800 bg-white'
                      : 'border border-neutral-200 bg-white',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-medium text-neutral-950">{workout.name}</span>
                    {workout.description && (
                      <span className="text-[13px] font-normal text-neutral-500">
                        {workout.description}
                      </span>
                    )}
                    <span className="text-[13px] font-normal text-neutral-500">
                      {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800">
                      <HugeiconsIcon icon={Tick01Icon} size={14} color="white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="h-1" />

          {/* Start Session */}
          <button
            onClick={handleStartSession}
            disabled={isPending}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
          >
            {isPending ? <Spinner className="text-white" /> : <HugeiconsIcon icon={PlayIcon} size={16} color="white" />}
            {isPending ? 'Starting…' : 'Start Session'}
          </button>

          {/* Skip workout option */}
          <button
            onClick={handleStartSession}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center text-[13px] font-normal text-neutral-400 disabled:opacity-50"
          >
            Skip — start without a workout
          </button>

        </div>
      </BottomDrawerContent>
    </BottomDrawer>
  )
}
