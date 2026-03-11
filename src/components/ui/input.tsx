import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Design token rules ────────────────────────────────────────────────────
// All inputs → rounded-base (4px)
// Background → white
// Border → neutral.200
// Focus border → neutral.800
// Placeholder → neutral.400
// Font weight → normal (400)
// ──────────────────────────────────────────────────────────────────────────

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-base border border-neutral-200 bg-white px-3 py-2 text-sm font-normal text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-0 focus:border-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
