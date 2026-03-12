'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cancel01Icon } from 'hugeicons-react'
import {
  BottomDrawer,
  BottomDrawerContent,
} from '@/components/ui/bottom-drawer'
import { recordPayment } from '@/actions/payments'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  onClose: () => void
  clientId: string
  tierAmount: number | null
  currency?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getMonthOptions(): { value: string; label: string }[] {
  const options = []
  const now = new Date()
  // Show 6 months back + current + 2 ahead
  for (let i = -6; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: formatMonthLabel(value) })
  }
  return options
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecordPaymentDrawer({ open, onClose, clientId, tierAmount, currency = 'OMR' }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState(tierAmount?.toFixed(2) ?? '')
  const [forMonth, setForMonth] = useState(getCurrentMonth())
  const [method, setMethod] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setAmount(tierAmount?.toFixed(2) ?? '')
      setForMonth(getCurrentMonth())
      setMethod('Cash')
      setNotes('')
      setError(null)
    }
  }, [open, tierAmount])

  function handleClose() {
    setError(null)
    onClose()
  }

  function handleSubmit() {
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await recordPayment({
        client_id: clientId,
        amount: parsedAmount,
        currency,
        for_month: forMonth,
        payment_method: method,
        notes,
      })
      if (result.error) {
        setError(result.error)
      } else {
        handleClose()
        router.refresh()
      }
    })
  }

  const monthOptions = getMonthOptions()

  return (
    <BottomDrawer open={open} onOpenChange={o => { if (!o) handleClose() }}>
      <BottomDrawerContent>
        <div className="flex flex-col gap-5 p-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-neutral-950">Record Payment</span>
            <button onClick={handleClose} className="text-neutral-400">
              <Cancel01Icon size={24} color="currentColor" />
            </button>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Amount ({currency})</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          {/* For Month */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">For Month</span>
            <select
              value={forMonth}
              onChange={e => setForMonth(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none appearance-none"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-normal text-neutral-950">Payment Method</span>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none appearance-none"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
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
            disabled={isPending}
            className="flex h-[52px] w-full items-center justify-center rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
          >
            {isPending ? 'Recording…' : 'Record Payment'}
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
