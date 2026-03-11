'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BarChart2, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Bottom Navigation ────────────────────────────────────────────────────
// Design token rules:
//   Active: neutral.800 icon + label
//   Inactive: neutral.400 icon, neutral.500 label
//   FAB center: fab (#9d174d) bg, white icon, rounded-full
//   Shadow: shadow-nav on the nav bar
// ──────────────────────────────────────────────────────────────────────────

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/stats', icon: BarChart2, label: 'Stats' },
  { href: '/more', icon: MoreHorizontal, label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[428px] -translate-x-1/2 bg-white border-t border-neutral-200 shadow-nav pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          // Insert FAB in the center (between index 1 and 2)
          const showFab = index === 2

          return (
            <React.Fragment key={item.href}>
              {showFab && <FabButton />}
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 min-w-[52px] py-1"
              >
                <Icon
                  size={24}
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
  )
}

function FabButton() {
  return (
    <button
      className="flex h-14 w-14 items-center justify-center rounded-full bg-fab text-white shadow-fab hover:bg-fab-hover active:bg-fab-active -mt-6 transition-colors"
      aria-label="Add"
    >
      <Plus size={24} />
    </button>
  )
}

// React needs to be in scope for Fragment
import React from 'react'
