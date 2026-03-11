import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Design token rules ────────────────────────────────────────────────────
// All badges/tags → rounded-base (4px)
// Membership: active=success.600, expiring=warning.500, expired=danger.600
// Training programs: neutral.100 bg, neutral.900 text, neutral.300 border
// Font weight → normal (400)
// ──────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  'inline-flex items-center rounded-base border px-2 py-0.5 text-xs font-normal transition-colors',
  {
    variants: {
      variant: {
        // Membership status
        active:    'bg-success-600 text-white border-transparent',
        expiring:  'bg-warning-500 text-neutral-900 border-transparent',
        expired:   'bg-danger-600 text-white border-transparent',
        // Training programs / tags
        tag:       'bg-neutral-100 text-neutral-900 border-neutral-300',
        // Rehab and athlete training programs
        rehab:     'bg-warning-50 text-warning-900 border-warning-200',
        athlete:   'bg-success-50 text-success-900 border-success-200',
        // Generic / neutral
        default:   'bg-neutral-100 text-neutral-900 border-neutral-200',
        // Attendance status
        scheduled:  'bg-neutral-100 text-neutral-500 border-neutral-200',
        attending:  'bg-neutral-800 text-white border-transparent',
        attended:   'bg-success-100 text-success-700 border-success-100',
        missed:     'bg-danger-100 text-danger-600 border-danger-100',
        rescheduled:'bg-warning-100 text-warning-700 border-warning-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
