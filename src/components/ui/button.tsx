import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Design token rules ────────────────────────────────────────────────────
// All buttons → borderRadius: base (4px) → rounded-base
// Primary → neutral.800 bg, white text
// Secondary → neutral.100 bg, neutral.950 text
// Ghost → transparent bg, neutral.900 text
// Destructive → danger.600 bg, white text
// FAB → fab.DEFAULT bg, white text, rounded-full (ONLY component that uses pink)
// Font weight → normal (400) on ALL button labels
// ──────────────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-neutral-800 text-white hover:bg-neutral-900 active:bg-neutral-950 rounded-base',
        secondary:
          'bg-neutral-100 text-neutral-950 hover:bg-neutral-200 active:bg-neutral-300 rounded-base border border-neutral-200',
        ghost:
          'bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 rounded-base',
        destructive:
          'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 rounded-base',
        fab:
          'bg-fab text-white hover:bg-fab-hover active:bg-fab-active rounded-full shadow-fab',
        link:
          'text-neutral-800 underline-offset-4 hover:underline font-normal',
      },
      size: {
        default: 'h-11 px-4 py-3',
        sm: 'h-9 px-3 py-2 text-xs',
        lg: 'h-12 px-6 py-3',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        fab: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
