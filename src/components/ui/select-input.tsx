'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { HugeiconsIcon, ArrowDown01Icon, Tick01Icon } from '@/components/ui/icon'

// ─── Design token rules ────────────────────────────────────────────────────
// Trigger → same style as Input (rounded-base, h-11, white bg, neutral-200 border)
// Dropdown → rounded-base, white bg, shadow, neutral-200 border
// Options → min-h-11 (44px) for comfortable touch targets
// Font weight → normal (400)
// ──────────────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

interface SelectInputProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  name?: string
}

function SelectInput({
  options,
  value: controlledValue,
  defaultValue = '',
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
  label,
  name,
}: SelectInputProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const selectedOption = options.find((opt) => opt.value === value)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  function handleSelect(optionValue: string) {
    if (!isControlled) {
      setInternalValue(optionValue)
    }
    onChange?.(optionValue)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <span className="mb-1 block text-[13px] font-normal text-neutral-500">
          {label}
        </span>
      )}

      {/* Hidden native input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-base border border-neutral-200 bg-white px-3 text-sm font-normal text-neutral-950 outline-none transition-colors',
          'focus:ring-2 focus:ring-neutral-800 focus:ring-offset-0 focus:border-neutral-800',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !selectedOption && 'text-neutral-400',
          open && 'ring-2 ring-neutral-800 border-neutral-800'
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          color="currentColor"
          className={cn(
            'ml-2 shrink-0 text-neutral-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-base border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {options.length === 0 && (
            <li className="px-3 py-3 text-sm font-normal text-neutral-400">
              No options available
            </li>
          )}
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              onClick={() => {
                if (!option.disabled) handleSelect(option.value)
              }}
              className={cn(
                'flex min-h-[44px] cursor-pointer items-center justify-between px-3 py-2.5 text-sm font-normal text-neutral-950 active:bg-neutral-100',
                option.value === value && 'bg-neutral-50',
                option.disabled &&
                  'cursor-not-allowed text-neutral-300 active:bg-transparent',
                !option.disabled && 'hover:bg-neutral-50'
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && (
                <HugeiconsIcon icon={Tick01Icon} size={16} color="currentColor" className="ml-2 shrink-0 text-neutral-800" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

SelectInput.displayName = 'SelectInput'

export { SelectInput }
