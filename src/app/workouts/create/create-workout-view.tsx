'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  Search01Icon,
  Cancel01Icon,
  Delete01Icon,
  Add01Icon,
} from '@/components/ui/icon'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { createExercise } from '@/actions/exercises'
import { createWorkout } from '@/actions/workouts'
import type { ExerciseRow } from '@/actions/exercises'
import type { WorkoutSetRow } from '@/actions/workouts'
import { Spinner } from '@/components/ui/spinner'

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkoutExercise = {
  exercise_id: string
  name: string
  body_part: string | null
  sets: WorkoutSetRow[]
}

// ─── Search Exercises Bottom Sheet ───────────────────────────────────────────

function SearchExercisesSheet({
  open,
  exercises,
  onClose,
  onSelect,
}: {
  open: boolean
  exercises: ExerciseRow[]
  onClose: () => void
  onSelect: (exercise: ExerciseRow) => void
}) {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBodyPart, setNewBodyPart] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises
    const q = search.toLowerCase()
    return exercises.filter(e => e.name.toLowerCase().includes(q))
  }, [exercises, search])

  function handleCreateExercise() {
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await createExercise({
        name: newName.trim(),
        body_part: newBodyPart || 'Other',
        equipment: 'None',
        instructions: null,
      })
      if (result.id) {
        onSelect({
          id: result.id,
          name: newName.trim(),
          body_part: newBodyPart || 'Other',
          target: null,
          equipment: null,
          instructions: null,
          is_custom: true,
        })
        setNewName('')
        setNewBodyPart('')
        setShowCreate(false)
      }
    })
  }

  function handleClose() {
    setSearch('')
    setShowCreate(false)
    setNewName('')
    setNewBodyPart('')
    onClose()
  }

  // Group exercises by body part
  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseRow[]>()
    for (const ex of filtered) {
      const key = ex.body_part ?? 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ex)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) handleClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-4 p-6 max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Search Exercises</span>
            <button onClick={handleClose} className="text-neutral-400">
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="currentColor" />
            </button>
          </div>

          {/* Search */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <HugeiconsIcon icon={Search01Icon} size={16} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-11 w-full rounded-base border border-neutral-200 bg-white pl-9 pr-3 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Create Custom */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-11 w-full items-center justify-center rounded-base border border-neutral-200 text-[14px] font-normal text-neutral-950"
            >
              + Create Custom Exercise
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-base border border-neutral-200 p-3 bg-white">
              <input
                type="text"
                placeholder="Exercise name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="h-10 rounded-base border border-neutral-200 px-3 text-[14px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
              />
              <select
                value={newBodyPart}
                onChange={e => setNewBodyPart(e.target.value)}
                className="h-10 rounded-base border border-neutral-200 px-3 text-[14px] font-normal text-neutral-950 bg-white outline-none appearance-none"
              >
                <option value="">Muscle group</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Core">Core</option>
              </select>
              <button
                onClick={handleCreateExercise}
                disabled={isPending || !newName.trim()}
                className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-base bg-neutral-800 text-[14px] font-normal text-white disabled:opacity-50"
              >
                {isPending ? <><Spinner size={14} className="text-white" /> Creating…</> : 'Create & Add'}
              </button>
            </div>
          )}

          {/* Section label */}
          <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
            Your Exercises
          </span>

          {/* Exercise list */}
          {filtered.length === 0 ? (
            <span className="text-[14px] font-normal text-neutral-400 text-center py-4">
              No exercises found
            </span>
          ) : (
            <div className="flex flex-col gap-1">
              {grouped.map(([group, exs]) => (
                <div key={group} className="flex flex-col">
                  {exs.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => { onSelect(ex); handleClose() }}
                      className="flex flex-col gap-0.5 rounded-base border-b border-neutral-100 px-3 py-3 text-left hover:bg-neutral-50"
                    >
                      <span className="text-[15px] font-medium text-neutral-950">{ex.name}</span>
                      <span className="text-[12px] font-normal text-neutral-500">{ex.body_part ?? 'Other'}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomDrawerContent>
    </BottomDrawer>
  )
}

// ─── Set Row ─────────────────────────────────────────────────────────────────

function SetGrid({
  sets,
  onChange,
}: {
  sets: WorkoutSetRow[]
  onChange: (sets: WorkoutSetRow[]) => void
}) {
  function updateSet(idx: number, field: 'reps' | 'weight_kg', value: number) {
    onChange(sets.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function removeSet(idx: number) {
    onChange(sets.filter((_, i) => i !== idx).map((s, i) => ({ ...s, set_number: i + 1 })))
  }

  function addSet() {
    const last = sets[sets.length - 1]
    onChange([...sets, { set_number: sets.length + 1, reps: last?.reps ?? 0, weight_kg: last?.weight_kg ?? 0 }])
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="grid grid-cols-[32px_1fr_1fr_28px] gap-2 px-1">
        <span className="text-[12px] font-normal text-neutral-400">Set</span>
        <span className="text-[12px] font-normal text-neutral-400">Reps</span>
        <span className="text-[12px] font-normal text-neutral-400">Weight (kg)</span>
        <span />
      </div>

      {/* Rows */}
      {sets.map((s, i) => (
        <div key={i} className="grid grid-cols-[32px_1fr_1fr_28px] gap-2 items-center px-1">
          <span className="text-[14px] font-normal text-neutral-950">{s.set_number}</span>
          <input
            type="number"
            inputMode="numeric"
            value={s.reps || ''}
            onChange={e => updateSet(i, 'reps', Number(e.target.value))}
            className="h-10 rounded-base border border-neutral-200 px-2 text-center text-[14px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800"
          />
          <input
            type="number"
            inputMode="decimal"
            value={s.weight_kg || ''}
            onChange={e => updateSet(i, 'weight_kg', Number(e.target.value))}
            className="h-10 rounded-base border border-neutral-200 px-2 text-center text-[14px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800"
          />
          <button onClick={() => removeSet(i)} className="text-neutral-400">
            <HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" />
          </button>
        </div>
      ))}

      <button
        onClick={addSet}
        className="text-[13px] font-normal text-neutral-500 py-1"
      >
        + Add Set
      </button>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

type Props = {
  exercises: ExerciseRow[]
  clientId?: string | null
}

export function CreateWorkoutView({ exercises, clientId = null }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddExercise(ex: ExerciseRow) {
    // Don't add duplicates
    if (workoutExercises.some(we => we.exercise_id === ex.id)) return
    setWorkoutExercises(prev => [
      ...prev,
      {
        exercise_id: ex.id,
        name: ex.name,
        body_part: ex.body_part,
        sets: [{ set_number: 1, reps: 0, weight_kg: 0 }],
      },
    ])
  }

  function handleRemoveExercise(idx: number) {
    setWorkoutExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function handleUpdateSets(idx: number, sets: WorkoutSetRow[]) {
    setWorkoutExercises(prev =>
      prev.map((we, i) => i === idx ? { ...we, sets } : we)
    )
  }

  function handleSave() {
    if (!name.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createWorkout({
        name: name.trim(),
        description: description.trim(),
        client_id: clientId,
        exercises: workoutExercises.map((we, i) => ({
          exercise_id: we.exercise_id,
          order_index: i,
          sets: we.sets,
        })),
      })
      if (result.error) {
        setError(result.error)
      } else {
        router.push(clientId ? `/clients/${clientId}` : `/workouts/${result.id}`)
      }
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 self-start">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="currentColor" className="text-neutral-500" />
          <span className="text-[13px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Create Workout
        </h1>

        {/* Form Card */}
        <div className="flex flex-col gap-4 rounded-base bg-white border border-neutral-200 p-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-neutral-950">Workout Name</span>
            <input
              type="text"
              placeholder="e.g., Upper Body Strength"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-neutral-950">Description (Optional)</span>
            <input
              type="text"
              placeholder="e.g., Focus on chest, back, and shoulders"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Add Exercise button */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} color="currentColor" />
          Add Exercise
        </button>

        {/* Exercises list */}
        {workoutExercises.map((we, idx) => (
          <div key={we.exercise_id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-base font-medium text-neutral-950">{we.name}</span>
                {we.body_part && (
                  <span className="text-[12px] font-normal text-neutral-500">{we.body_part}</span>
                )}
              </div>
              <button onClick={() => handleRemoveExercise(idx)} className="text-danger-600">
                <HugeiconsIcon icon={Delete01Icon} size={18} color="currentColor" />
              </button>
            </div>
            <SetGrid
              sets={we.sets}
              onChange={sets => handleUpdateSets(idx, sets)}
            />
            {idx < workoutExercises.length - 1 && <div className="h-px bg-neutral-200" />}
          </div>
        ))}

        {error && (
          <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
        )}

        {/* Save button */}
        {workoutExercises.length > 0 && (
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
          >
            {isPending ? <><Spinner className="text-white" /> Saving…</> : 'Save Workout'}
          </button>
        )}
      </div>

      <SearchExercisesSheet
        open={showSearch}
        exercises={exercises}
        onClose={() => setShowSearch(false)}
        onSelect={handleAddExercise}
      />
    </main>
  )
}
