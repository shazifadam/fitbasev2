'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse } from 'date-fns'
import { HugeiconsIcon, Calendar01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// ─── Design token rules ────────────────────────────────────────────────────
// Trigger → h-11 (44px), rounded-base, white bg, neutral-200 border
// Calendar → rounded-card, white bg, shadow, neutral-200 border
// Day cells → 36px, rounded-full for selected state
// Font weight → normal (400) everywhere, medium (500) for month/year header
// ──────────────────────────────────────────────────────────────────────────

interface DatePickerProps {
  value?: string // ISO date string YYYY-MM-DD
  onChange?: (value: string) => void
  placeholder?: string
  min?: string
  disabled?: boolean
  className?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  min,
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const minDate = min ? parse(min, 'yyyy-MM-dd', new Date()) : undefined

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClick)
    return () => document.removeEventListener('pointerdown', handleClick)
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange?.(format(date, 'yyyy-MM-dd'))
    }
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-base border border-neutral-200 bg-white px-3 text-[15px] font-normal text-neutral-950 outline-none transition-colors',
          'focus:border-neutral-800',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !value && 'text-neutral-400',
          open && 'border-neutral-800',
        )}
      >
        <span className="truncate">
          {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
        </span>
        <HugeiconsIcon
          icon={Calendar01Icon}
          size={16}
          color="currentColor"
          className="ml-2 shrink-0 text-neutral-400"
        />
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-card border border-neutral-200 bg-white p-3 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
            disabled={minDate ? { before: minDate } : undefined}
            showOutsideDays
            components={{
              Chevron: ({ orientation }) => (
                <HugeiconsIcon
                  icon={orientation === 'left' ? ArrowLeft01Icon : ArrowRight01Icon}
                  size={16}
                  color="currentColor"
                  className="text-neutral-600"
                />
              ),
            }}
            classNames={{
              months: 'flex flex-col',
              month_caption: 'flex items-center justify-center py-1',
              caption_label: 'text-[15px] font-medium text-neutral-950',
              nav: 'flex items-center justify-between absolute inset-x-0 top-3 px-3',
              button_previous: 'flex h-8 w-8 items-center justify-center rounded-base hover:bg-neutral-100',
              button_next: 'flex h-8 w-8 items-center justify-center rounded-base hover:bg-neutral-100',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex',
              weekday: 'flex-1 text-center text-[11px] font-normal text-neutral-400 py-2',
              week: 'flex',
              day: 'flex-1 text-center p-0',
              day_button: cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-normal text-neutral-950 mx-auto',
                'hover:bg-neutral-100 focus:outline-none',
              ),
              selected: 'bg-neutral-800 text-white hover:bg-neutral-800',
              today: 'font-medium',
              outside: 'text-neutral-300',
              disabled: 'text-neutral-200 cursor-not-allowed hover:bg-transparent',
            }}
          />
        </div>
      )}
    </div>
  )
}

DatePicker.displayName = 'DatePicker'

export { DatePicker }
export type { DatePickerProps }
