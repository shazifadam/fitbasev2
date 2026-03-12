'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Add01Icon,
  Cancel01Icon,
} from 'hugeicons-react'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { createTier, updateTier, deleteTier } from '@/actions/tiers'
import type { TierDetail } from '@/actions/tiers'
import { Spinner } from '@/components/ui/spinner'

// ─── Tier Drawer ──────────────────────────────────────────────────────────────

function TierDrawer({
  open,
  onClose,
  editTier,
}: {
  open: boolean
  onClose: () => void
  editTier: TierDetail | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(editTier?.name ?? '')
  const [amount, setAmount] = useState(editTier?.amount?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)

  // Reset form when drawer opens with new data
  const isEdit = !!editTier

  function handleClose() {
    setError(null)
    onClose()
  }

  function handleSubmit() {
    if (!name.trim()) { setError('Tier name is required'); return }
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount < 0) { setError('Enter a valid price'); return }

    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateTier(editTier.id, { name: name.trim(), amount: parsedAmount })
        : await createTier({ name: name.trim(), amount: parsedAmount })

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
              {isEdit ? 'Edit Tier' : 'Create New Tier'}
            </span>
            <button onClick={handleClose} className="text-neutral-400">
              <Cancel01Icon size={24} color="currentColor" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Tier Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Premium"
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Price (MVR)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 40.00"
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
              ? <><Spinner className="text-white" /> {isEdit ? 'Saving…' : 'Creating…'}</>
              : (isEdit ? 'Save Changes' : 'Create Tier')
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
  tiers: TierDetail[]
}

export function TierManagementView({ tiers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<TierDetail | null>(null)

  function handleCreate() {
    setEditingTier(null)
    setDrawerOpen(true)
  }

  function handleEdit(tier: TierDetail) {
    setEditingTier(tier)
    setDrawerOpen(true)
  }

  function handleDelete(tier: TierDetail) {
    if (!confirm(`Delete "${tier.name}" tier? Clients on this tier will have no tier assigned.`)) return
    startTransition(async () => {
      await deleteTier(tier.id)
      router.refresh()
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    setEditingTier(null)
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 self-start">
          <ArrowLeft01Icon size={18} color="currentColor" className="text-neutral-500" />
          <span className="text-[13px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Tier Management
        </h1>

        {/* Tier count */}
        <div className="flex items-center justify-between -mt-2">
          <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
            Your Tiers
          </span>
          <span className="text-[13px] font-normal text-neutral-500">
            {tiers.length} tiers
          </span>
        </div>

        {/* Tier List */}
        {tiers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] font-normal text-neutral-400">No tiers created yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tiers.map(tier => (
              <div
                key={tier.id}
                className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-medium text-neutral-950">{tier.name}</span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    MVR {Number(tier.amount).toFixed(2)} / month
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(tier)} className="text-neutral-400">
                    <PencilEdit01Icon size={18} color="currentColor" />
                  </button>
                  <button onClick={() => handleDelete(tier)} className="text-danger-600" disabled={isPending}>
                    <Delete01Icon size={18} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Tier Button */}
        <button
          onClick={handleCreate}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white"
        >
          <Add01Icon size={18} color="currentColor" />
          Add New Tier
        </button>

      </div>

      {/* Create / Edit Tier Drawer */}
      {drawerOpen && (
        <TierDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          editTier={editingTier}
        />
      )}
    </main>
  )
}
