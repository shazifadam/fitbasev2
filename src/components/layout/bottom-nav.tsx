'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home01Icon,
  UserGroupIcon,
  BarChartIcon,
  MoreHorizontalIcon,
  Add01Icon,
  Cancel01Icon,
  Money01Icon,
  ChartLineData01Icon,
  UserAdd01Icon,
} from 'hugeicons-react'
import { cn } from '@/lib/utils'

// ─── Bottom Navigation ────────────────────────────────────────────────────
// Design token rules:
//   Active: neutral.800 icon + label
//   Inactive: neutral.400 icon, neutral.500 label
//   FAB center: fab (#9d174d) bg, white icon, rounded-full
//   Shadow: shadow-nav on the nav bar
// ──────────────────────────────────────────────────────────────────────────

const navItems = [
  { href: '/dashboard', icon: Home01Icon,        label: 'Home' },
  { href: '/clients',   icon: UserGroupIcon,      label: 'Clients' },
  { href: '/stats',     icon: BarChartIcon,       label: 'Stats' },
  { href: '/more',      icon: MoreHorizontalIcon, label: 'More' },
]

const fabMenuItems = [
  { href: '/payments/record', icon: Money01Icon,         label: 'Record Payment' },
  { href: '/progress/record', icon: ChartLineData01Icon, label: 'Record Progress' },
  { href: '/clients/add',     icon: UserAdd01Icon,       label: 'Add Client' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [fabOpen, setFabOpen] = useState(false)

  function handleMenuItemClick(href: string) {
    setFabOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* FAB Overlay Menu */}
      <AnimatePresence>
        {fabOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              key="fab-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setFabOpen(false)}
            />

            {/* Menu items */}
            <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 w-full max-w-[428px] flex flex-col items-end gap-3 px-6 pb-4">
              {fabMenuItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      duration: 0.2,
                      delay: (fabMenuItems.length - 1 - i) * 0.05,
                    }}
                    onClick={() => handleMenuItemClick(item.href)}
                    className="flex items-center gap-3"
                  >
                    <span className="rounded-base bg-white px-4 py-2.5 text-[14px] font-normal text-neutral-950 shadow-lg border border-neutral-200">
                      {item.label}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-neutral-200">
                      <Icon size={20} color="currentColor" className="text-neutral-800" />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Nav Bar */}
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[428px] -translate-x-1/2 bg-white border-t border-neutral-200 shadow-nav pb-safe">
        <div className="flex items-center justify-around px-2 pt-2 pb-2">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            // Insert FAB in the center (between index 1 and 2)
            const showFab = index === 2

            return (
              <React.Fragment key={item.href}>
                {showFab && (
                  <button
                    onClick={() => setFabOpen(prev => !prev)}
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full text-white shadow-fab -mt-6 transition-all duration-200',
                      fabOpen
                        ? 'bg-neutral-800 rotate-0'
                        : 'bg-fab hover:bg-fab-hover active:bg-fab-active'
                    )}
                    aria-label={fabOpen ? 'Close menu' : 'Open menu'}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {fabOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Cancel01Icon size={24} color="white" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="add"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Add01Icon size={24} color="white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 min-w-[52px] py-1"
                >
                  <Icon
                    size={24}
                    color="currentColor"
                    className={cn(
                      isActive ? 'text-neutral-800' : 'text-neutral-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-normal',
                      isActive ? 'text-neutral-800' : 'text-neutral-500'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </React.Fragment>
            )
          })}
        </div>
      </nav>
    </>
  )
}
