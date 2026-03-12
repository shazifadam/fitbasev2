'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft01Icon,
  Search01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Cancel01Icon,
} from 'hugeicons-react'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { createExercise, deleteExercise } from '@/actions/exercises'
import type { ExerciseRow } from '@/actions/exercises'

// ─── Body Part Filters ───────────────────────────────────────────────────────

const BODY_PARTS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']

// ─── Add Exercise Drawer ─────────────────────────────────────────────────────

function AddExerciseDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [equipment, setEquipment] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setName('')
    setBodyPart('')
    setEquipment('')
    setNotes('')
    setError(null)
    onClose()
  }

  function handleSubmit() {
    if (!name.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createExercise({
        name: name.trim(),
        body_part: bodyPart || 'Other',
        equipment: equipment || 'None',
        instructions: notes.trim() ? [notes.trim()] : null,
      })
      if (result.error) {
        setError(result.error)
      } else {
        handleClose()
      }
    })
  }

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) handleClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Add New Exercise</span>
            <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-600">
              <Cancel01Icon size={24} color="currentColor" />
            </button>
          </div>

          {/* Exercise Name */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-neutral-950">Exercise Name</span>
            <input
              type="text"
              placeholder="e.g. Bench Press"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          {/* Muscle Group */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-neutral-950">Muscle Group</span>
            <select
              value={bodyPart}
              onChange={e => setBodyPart(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 appearance-none"
            >
              <option value="">Select muscle group</option>
              {BODY_PARTS.filter(b => b !== 'All').map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Equipment */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-neutral-950">Equipment</span>
            <select
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 appearance-none"
            >
              <option value="">Select equipment</option>
              <option value="Barbell">Barbell</option>
              <option value="Dumbbell">Dumbbell</option>
              <option value="Machine">Machine</option>
              <option value="Cable">Cable</option>
              <option value="Bodyweight">Bodyweight</option>
              <option value="Kettlebell">Kettlebell</option>
              <option value="Bands">Bands</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-neutral-950">Notes (optional)</span>
            <textarea
              placeholder="Add any notes about this exercise..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="rounded-base border border-neutral-200 px-3 py-2.5 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="flex h-[52px] w-full items-center justify-center rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
          >
            {isPending ? 'Adding…' : 'Add Exercise'}
          </button>

          <button
            onClick={handleClose}
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

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  exercises: ExerciseRow[]
}

export function ExerciseLibraryView({ exercises }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    let list = exercises
    if (filter !== 'All') {
      list = list.filter(e =>
        (e.body_part ?? '').toLowerCase() === filter.toLowerCase()
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.name.toLowerCase().includes(q))
    }
    return list
  }, [exercises, filter, search])

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteExercise(id)
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft01Icon size={20} color="currentColor" className="text-neutral-950" />
          </button>
          <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
            Exercise Library
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search01Icon size={18} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-11 w-full rounded-base border border-neutral-200 bg-white pl-10 pr-3 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {BODY_PARTS.map(bp => (
            <button
              key={bp}
              onClick={() => setFilter(bp)}
              className={`shrink-0 rounded-base px-3 py-1.5 text-[13px] font-normal border ${
                filter === bp
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-white text-neutral-950 border-neutral-200'
              }`}
            >
              {bp}
            </button>
          ))}
        </div>

        {/* Exercise count */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-neutral-950">Exercises</span>
          <span className="text-[13px] font-normal text-neutral-500">
            {filtered.length} exercises
          </span>
        </div>

        {/* Exercise list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-[15px] font-normal text-neutral-400">No exercises found</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map(ex => (
              <div
                key={ex.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-medium text-neutral-950">{ex.name}</span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {ex.body_part ?? 'Uncategorized'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-neutral-400">
                    <PencilEdit01Icon size={18} color="currentColor" />
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id)}
                    disabled={isPending}
                    className="text-danger-600"
                  >
                    <Delete01Icon size={18} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Exercise button */}
        <button
          onClick={() => setShowAddDrawer(true)}
          className="flex h-[52px] w-full items-center justify-center rounded-base bg-neutral-800 text-base font-normal text-white"
        >
          + Add Exercise
        </button>

      </div>

      <AddExerciseDrawer
        open={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
      />
    </main>
  )
}
