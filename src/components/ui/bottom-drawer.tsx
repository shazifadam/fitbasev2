'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

// ─── Bottom Drawer (Bottom Sheet) ─────────────────────────────────────────
// Used for: SessionActionDrawer, WorkoutSelectionDrawer
// Design token rules:
//   Outer shell → rounded-card (12px) on TOP corners only, flat bottom
//   Overlay → rgba(0,0,0,0.4)
//   Handle bar → w-10 (40px), h-1, bg-neutral-300, rounded-full, centered
//   Action buttons inside → rounded-base (4px)
// ──────────────────────────────────────────────────────────────────────────

const BottomDrawer = DialogPrimitive.Root
const BottomDrawerTrigger = DialogPrimitive.Trigger
const BottomDrawerClose = DialogPrimitive.Close
const BottomDrawerPortal = DialogPrimitive.Portal

const BottomDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
BottomDrawerOverlay.displayName = 'BottomDrawerOverlay'

const BottomDrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <BottomDrawerPortal>
    <BottomDrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Position at bottom, full width, max 428px centered
        'fixed bottom-0 left-1/2 z-50 w-full max-w-[428px] -translate-x-1/2',
        // Outer shell: rounded top corners only (12px), flat bottom
        'rounded-t-card bg-white',
        // Animations: slide up/down
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        'duration-300',
        className
      )}
      {...props}
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="h-1 w-10 rounded-full bg-neutral-300" />
      </div>
      {children}
    </DialogPrimitive.Content>
  </BottomDrawerPortal>
))
BottomDrawerContent.displayName = 'BottomDrawerContent'

const BottomDrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-4 pb-2', className)} {...props} />
)
BottomDrawerHeader.displayName = 'BottomDrawerHeader'

const BottomDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-medium text-neutral-950', className)}
    {...props}
  />
))
BottomDrawerTitle.displayName = 'BottomDrawerTitle'

const BottomDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm font-normal text-neutral-500', className)}
    {...props}
  />
))
BottomDrawerDescription.displayName = 'BottomDrawerDescription'

const BottomDrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-4 pb-4 pb-safe', className)} {...props} />
)
BottomDrawerBody.displayName = 'BottomDrawerBody'

export {
  BottomDrawer,
  BottomDrawerTrigger,
  BottomDrawerClose,
  BottomDrawerContent,
  BottomDrawerHeader,
  BottomDrawerTitle,
  BottomDrawerDescription,
  BottomDrawerBody,
}
