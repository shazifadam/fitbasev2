'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Bottom Drawer (Bottom Sheet) ─────────────────────────────────────────
// Animated with framer-motion: bezier ease-out slide-up from bottom
// Overlay: fade in/out
// ──────────────────────────────────────────────────────────────────────────

// Context so BottomDrawerContent can read open state
const DrawerOpenContext = React.createContext(false)

function BottomDrawer({
  open,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return (
    <DrawerOpenContext.Provider value={!!open}>
      <DialogPrimitive.Root open={open} {...props} />
    </DrawerOpenContext.Provider>
  )
}

const BottomDrawerTrigger = DialogPrimitive.Trigger
const BottomDrawerClose = DialogPrimitive.Close

const BottomDrawerContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const open = React.useContext(DrawerOpenContext)

  return (
    <DialogPrimitive.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                key="drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed inset-0 z-50 bg-black/40"
              />
            </DialogPrimitive.Overlay>

            {/* Sheet */}
            <DialogPrimitive.Content asChild forceMount {...props}>
              <motion.div
                ref={ref}
                key="drawer-content"
                className={cn(
                  'fixed bottom-0 left-0 right-0 z-50 w-full max-w-[428px] mx-auto',
                  'rounded-t-card bg-white outline-none',
                  className
                )}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{
                  type: 'tween',
                  ease: [0.32, 0.72, 0, 1],
                  duration: 0.4,
                }}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="h-1 w-10 rounded-full bg-neutral-300" />
                </div>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </>
        )}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  )
})
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
