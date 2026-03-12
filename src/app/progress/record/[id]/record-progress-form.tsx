'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon, ArrowLeft01Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { recordProgress } from '@/actions/progress'
import type { PreviousMeasurement } from '@/actions/progress'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  client: {
    id: string
    name: string
    programs: string[] | null
  }
  previous: PreviousMeasurement
}

export function RecordProgressForm({ client, previous }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [date, setDate] = useState(todayString())
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [fatPercent, setFatPercent] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const initials = client.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function handleSubmit() {
    const w = weight.trim() ? parseFloat(weight) : null
    const h = height.trim() ? parseFloat(height) : null
    const f = fatPercent.trim() ? parseFloat(fatPercent) : null

    if (w == null && h == null && f == null) {
      setError('Enter at least one measurement')
      return
    }
    if ((w != null && isNaN(w)) || (h != null && isNaN(h)) || (f != null && isNaN(f))) {
      setError('Enter valid numbers')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await recordProgress({
        client_id: client.id,
        weight: w,
        height: h,
        fat_percent: f,
        notes,
        recorded_at: date,
      })
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 self-start">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="currentColor" className="text-neutral-500" />
          <span className="text-[13px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Record Progress
        </h1>

        {/* Client Info Card */}
        <div className="flex items-center gap-3 rounded-base bg-white border border-neutral-200 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-[14px] font-medium">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-medium text-neutral-950">{client.name}</span>
            <span className="text-[13px] font-normal text-neutral-500">
              {client.programs?.join(' · ') ?? 'No programs'}
            </span>
          </div>
        </div>

        {/* Previous Measurement — shown at top */}
        {previous && (
          <div className="flex flex-col gap-3">
            <span className="text-[16px] font-medium text-neutral-950">Previous Measurement</span>
            <div className="flex justify-between rounded-base bg-neutral-100 border border-neutral-200 p-3 px-4">
              {previous.weight != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-neutral-950">{previous.weight} kg</span>
                  <span className="text-[12px] font-normal text-neutral-500">Weight</span>
                </div>
              )}
              {previous.height != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-neutral-950">{previous.height} cm</span>
                  <span className="text-[12px] font-normal text-neutral-500">Height</span>
                </div>
              )}
              {previous.fat_percent != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-neutral-950">{previous.fat_percent}%</span>
                  <span className="text-[12px] font-normal text-neutral-500">Body Fat</span>
                </div>
              )}
            </div>
            <span className="text-[12px] font-normal text-neutral-400">
              Recorded on {formatDate(previous.recorded_at.split('T')[0])}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-medium text-neutral-950">Date</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="h-12 w-full rounded-base border border-neutral-200 bg-white px-4 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 box-border"
          />
        </div>

        {/* Measurements */}
        <div className="flex flex-col gap-4">
          <span className="text-xl font-medium text-neutral-950">Measurements</span>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-neutral-950">Weight (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 72.5"
              className="h-12 w-full rounded-base border border-neutral-200 bg-white px-4 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-neutral-950">Height (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="e.g. 175"
              className="h-12 w-full rounded-base border border-neutral-200 bg-white px-4 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-neutral-950">Body Fat (%)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={fatPercent}
              onChange={e => setFatPercent(e.target.value)}
              placeholder="e.g. 18.0"
              className="h-12 w-full rounded-base border border-neutral-200 bg-white px-4 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-neutral-950">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Good progress this month, continue current diet plan."
              rows={3}
              className="w-full rounded-base border border-neutral-200 bg-white px-4 py-3 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400 resize-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
        )}

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
        >
          {isPending ? <><Spinner className="text-white" /> Saving…</> : 'Save Progress'}
        </button>
      </div>
    </main>
  )
}
