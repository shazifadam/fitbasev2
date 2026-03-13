'use client'

import { useRouter } from 'next/navigation'
import { HugeiconsIcon, ArrowLeft01Icon, PencilEdit01Icon } from '@/components/ui/icon'
import type { WorkoutDetail } from '@/actions/workouts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function totalSets(workout: WorkoutDetail): number {
  return workout.exercises.reduce((sum, e) => sum + e.sets.length, 0)
}

function estimatedMinutes(workout: WorkoutDetail): number {
  // ~2 min per set as rough estimate
  return Math.round(totalSets(workout) * 2)
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  workout: WorkoutDetail
}

export function WorkoutDetailView({ workout }: Props) {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 self-start -ml-2 px-2 py-2 rounded-base active:bg-neutral-200">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" className="text-neutral-500" />
          <span className="text-[14px] font-normal text-neutral-500">Back</span>
        </button>

        {/* Title + Edit */}
        <div className="flex items-start justify-between -mt-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
              {workout.name}
            </h1>
            {workout.description && (
              <span className="text-[14px] font-normal text-neutral-500">
                {workout.description}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push(`/workouts/${workout.id}/edit`)}
            className="flex items-center gap-1.5 rounded-base border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-normal text-neutral-950"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={14} color="currentColor" />
            Edit
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base border border-neutral-200 bg-white py-3">
            <span className="text-[22px] font-medium text-neutral-950">
              {workout.exercises.length}
            </span>
            <span className="text-[12px] font-normal text-neutral-500">Exercises</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base border border-neutral-200 bg-white py-3">
            <span className="text-[22px] font-medium text-neutral-950">
              {totalSets(workout)}
            </span>
            <span className="text-[12px] font-normal text-neutral-500">Total Sets</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-base border border-neutral-200 bg-white py-3">
            <span className="text-[22px] font-medium text-neutral-950">
              ~{estimatedMinutes(workout)}
            </span>
            <span className="text-[12px] font-normal text-neutral-500">Est. Mins</span>
          </div>
        </div>

        {/* Exercises section label */}
        <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
          Exercises
        </span>

        {/* Exercise cards */}
        {workout.exercises.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] font-normal text-neutral-400">No exercises added yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workout.exercises.map(we => (
              <div
                key={we.id}
                className="flex flex-col gap-3 rounded-base bg-white border border-neutral-200 p-4"
              >
                {/* Exercise header */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-medium text-neutral-950">{we.exercise.name}</span>
                    <span className="text-[12px] font-normal text-neutral-500">
                      {we.exercise.body_part ?? 'Uncategorized'}
                    </span>
                  </div>
                  <span className="rounded-base bg-neutral-100 px-2 py-0.5 text-[12px] font-normal text-neutral-600">
                    {we.sets.length} sets
                  </span>
                </div>

                {/* Sets table */}
                {we.sets.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="grid grid-cols-3 gap-2 px-1">
                      <span className="text-[12px] font-normal text-neutral-400">Set</span>
                      <span className="text-[12px] font-normal text-neutral-400">Reps</span>
                      <span className="text-[12px] font-normal text-neutral-400">Weight</span>
                    </div>
                    {we.sets.map((s, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 px-1">
                        <span className="text-[14px] font-normal text-neutral-950">{s.set_number}</span>
                        <span className="text-[14px] font-normal text-neutral-950">{s.reps} reps</span>
                        <span className="text-[14px] font-normal text-neutral-950">
                          {s.weight_kg > 0 ? `${s.weight_kg} kg` : 'BW'}
                        </span>
                      </div>
                    ))}
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
