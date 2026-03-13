'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Add01Icon,
  Cancel01Icon,
} from '@/components/ui/icon'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import {
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
} from '@/actions/training-programs'
import type { TrainingProgram } from '@/actions/training-programs'
import { Spinner } from '@/components/ui/spinner'

// ─── Program Drawer ──────────────────────────────────────────────────────────

function ProgramDrawer({
  open,
  onClose,
  editProgram,
}: {
  open: boolean
  onClose: () => void
  editProgram: TrainingProgram | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(editProgram?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!editProgram

  function handleClose() {
    setError(null)
    onClose()
  }

  function handleSubmit() {
    if (!name.trim()) { setError('Program name is required'); return }

    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateTrainingProgram(editProgram.id, name.trim())
        : await createTrainingProgram(name.trim())

      if (result.error) {
        setError(result.error)
      } else {
        handleClose()
        router.refresh()
      }
    })
  }

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) handleClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-5 p-6">

          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">
              {isEdit ? 'Edit Program' : 'Add New Program'}
            </span>
            <button onClick={handleClose} className="text-neutral-400">
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="currentColor" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Program Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Strength"
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          {error && (
            <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
          >
            {isPending
              ? <><Spinner className="text-white" /> {isEdit ? 'Saving…' : 'Adding…'}</>
              : (isEdit ? 'Save Changes' : 'Add Program')
            }
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
  programs: TrainingProgram[]
}

export function ProgramManagementView({ programs }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null)

  function handleCreate() {
    setEditingProgram(null)
    setDrawerOpen(true)
  }

  function handleEdit(program: TrainingProgram) {
    setEditingProgram(program)
    setDrawerOpen(true)
  }

  function handleDelete(program: TrainingProgram) {
    if (!confirm(`Delete "${program.name}"? Clients using this program tag will keep it in their records.`)) return
    startTransition(async () => {
      await deleteTrainingProgram(program.id)
      router.refresh()
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    setEditingProgram(null)
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">

        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 self-start -ml-2 px-2 py-2 rounded-base active:bg-neutral-200">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" className="text-neutral-500" />
          <span className="text-[14px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Training Programs
        </h1>

        {/* Count */}
        <div className="flex items-center justify-between -mt-2">
          <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
            Your Programs
          </span>
          <span className="text-[13px] font-normal text-neutral-500">
            {programs.length} programs
          </span>
        </div>

        {/* Program List */}
        {programs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] font-normal text-neutral-400">No programs created yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {programs.map(program => (
              <div
                key={program.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4"
              >
                <span className="text-[15px] font-medium text-neutral-950">{program.name}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(program)} className="text-neutral-400">
                    <HugeiconsIcon icon={PencilEdit01Icon} size={18} color="currentColor" />
                  </button>
                  <button onClick={() => handleDelete(program)} className="text-danger-600" disabled={isPending}>
                    <HugeiconsIcon icon={Delete01Icon} size={18} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Program Button */}
        <button
          onClick={handleCreate}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} color="currentColor" />
          Add New Program
        </button>

      </div>

      {/* Create / Edit Program Drawer */}
      {drawerOpen && (
        <ProgramDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          editProgram={editingProgram}
        />
      )}
    </main>
  )
}
