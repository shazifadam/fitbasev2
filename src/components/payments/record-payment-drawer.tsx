'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon, Cancel01Icon } from '@/components/ui/icon'
import { SelectInput } from '@/components/ui/select-input'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { recordPayment } from '@/actions/payments'
import { Spinner } from '@/components/ui/spinner'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  onClose: () => void
  clientId: string
  tierAmount: number | null
  currency?: string
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecordPaymentDrawer({ open, onClose, clientId, tierAmount, currency = 'MVR', onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [method, setMethod] = useState('Bank Transfer')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setMethod('Bank Transfer')
      setNotes('')
      setError(null)
    }
  }, [open])

  function handleClose() {
    setError(null)
    onClose()
  }

  function handleSubmit() {
    if (!tierAmount || tierAmount <= 0) {
      setError('No tier amount set for this client')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await recordPayment({
        client_id: clientId,
        amount: tierAmount,
        currency,
        payment_method: method,
        notes,
      })
      if (result.error) {
        setError(result.error)
      } else {
        handleClose()
        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      }
    })
  }

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) handleClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-5 p-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Record Payment</span>
            <button onClick={handleClose} className="text-neutral-400">
              <HugeiconsIcon icon={Cancel01Icon} size={24} color="currentColor" />
            </button>
          </div>

          {/* Amount (read-only from tier) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Amount ({currency})</span>
            <div className="flex h-11 items-center rounded-base border border-neutral-200 bg-neutral-50 px-3">
              <span className="text-[15px] font-medium text-neutral-950">
                {tierAmount != null ? tierAmount.toFixed(2) : '—'}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Payment Method</span>
            <SelectInput
              options={[
                { label: 'Bank Transfer', value: 'Bank Transfer' },
                { label: 'Cash', value: 'Cash' },
                { label: 'Card', value: 'Card' },
                { label: 'Other', value: 'Other' },
              ]}
              value={method}
              onChange={setMethod}
              placeholder="Select method"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Notes (optional)</span>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add a note..."
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          {error && (
            <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isPending || !tierAmount}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
          >
            {isPending ? <><Spinner className="text-white" /> Recording…</> : 'Record Payment'}
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
