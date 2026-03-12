'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  Search01Icon,
  Add01Icon,
  ArrowRight01Icon,
} from '@/components/ui/icon'
import type { WorkoutSummary } from '@/actions/workouts'

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  workouts: WorkoutSummary[]
}

export function WorkoutsView({ workouts }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return workouts
    const q = search.toLowerCase()
    return workouts.filter(w => w.name.toLowerCase().includes(q))
  }, [workouts, search])

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/more')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" className="text-neutral-950" />
          </button>
          <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
            Workout Programs
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} size={18} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-11 w-full rounded-base border border-neutral-200 bg-white pl-10 pr-3 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Workout count */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-neutral-950">Workouts</span>
          <span className="text-[13px] font-normal text-neutral-500">
            {filtered.length} {filtered.length === 1 ? 'workout' : 'workouts'}
          </span>
        </div>

        {/* Workout list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-[15px] font-normal text-neutral-400">
              {search.trim() ? 'No workouts found' : 'No workout programs yet'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map(workout => (
              <Link
                key={workout.id}
                href={`/workouts/${workout.id}`}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-[15px] font-medium text-neutral-950">{workout.name}</span>
                  {workout.description && (
                    <span className="text-[13px] font-normal text-neutral-500 truncate">
                      {workout.description}
                    </span>
                  )}
                  <span className="text-[13px] font-normal text-neutral-400">
                    {workout.exerciseCount} {workout.exerciseCount === 1 ? 'exercise' : 'exercises'}
                  </span>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="currentColor" className="text-neutral-400 shrink-0 ml-3" />
              </Link>
            ))}
          </div>
        )}

        {/* Create Workout button */}
        <Link
          href="/workouts/create"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} color="currentColor" />
          Create Workout
        </Link>

      </div>
    </main>
  )
}
