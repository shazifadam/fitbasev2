'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HugeiconsIcon,
  ArrowRight01Icon,
  Layers01Icon,
  Dumbbell01Icon,
  Notebook02Icon,
  Download01Icon,
  InformationCircleIcon,
  SecurityLockIcon,
  Logout01Icon,
} from '@/components/ui/icon'
import { signOut } from '@/actions/profile'
import { Spinner } from '@/components/ui/spinner'
import type { TrainerProfileDetail } from '@/actions/profile'

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  profile: TrainerProfileDetail
}

export function MoreView({ profile }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await signOut()
      router.push('/login')
    })
  }

  const initials = profile.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-normal text-neutral-500">Settings</span>
          <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
            More
          </h1>
        </div>

        {/* Profile Card */}
        <Link
          href="/more/profile"
          className="flex items-center gap-4 rounded-base bg-white border border-neutral-200 p-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white text-base font-medium">
            {initials}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-[15px] font-medium text-neutral-950">{profile.display_name}</span>
            <span className="text-[13px] font-normal text-neutral-500">{profile.email}</span>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="currentColor" className="text-neutral-400" />
        </Link>

        {/* Management Section */}
        <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
          Management
        </span>

        <div className="flex flex-col rounded-base bg-white border border-neutral-200 overflow-hidden">
          <Link
            href="/more/tiers"
            className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Layers01Icon} size={20} color="currentColor" className="text-neutral-500" />
              <span className="text-[15px] font-normal text-neutral-950">Tier Management</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" className="text-neutral-400" />
          </Link>
          <Link
            href="/exercises"
            className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Dumbbell01Icon} size={20} color="currentColor" className="text-neutral-500" />
              <span className="text-[15px] font-normal text-neutral-950">Exercise Library</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" className="text-neutral-400" />
          </Link>
          <Link
            href="/workouts"
            className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Notebook02Icon} size={20} color="currentColor" className="text-neutral-500" />
              <span className="text-[15px] font-normal text-neutral-950">Workout Programs</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" className="text-neutral-400" />
          </Link>
          <button
            className="flex items-center justify-between px-4 py-3.5 w-full text-left"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Download01Icon} size={20} color="currentColor" className="text-neutral-500" />
              <span className="text-[15px] font-normal text-neutral-950">Export Data</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" className="text-neutral-400" />
          </button>
        </div>

        {/* App Section */}
        <span className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider">
          App
        </span>

        <div className="flex flex-col rounded-base bg-white border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={InformationCircleIcon} size={20} color="currentColor" className="text-neutral-500" />
              <span className="text-[15px] font-normal text-neutral-950">About Fitbase</span>
            </div>
            <span className="text-[13px] font-normal text-neutral-400">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={SecurityLockIcon} size={20} color="currentColor" className="text-neutral-500" />
              <span className="text-[15px] font-normal text-neutral-950">Privacy Policy</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" className="text-neutral-400" />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-danger-50 text-base font-normal text-danger-600 disabled:opacity-50"
        >
          {isPending ? <Spinner className="text-danger-600" /> : <HugeiconsIcon icon={Logout01Icon} size={18} color="currentColor" />}
          {isPending ? 'Logging out…' : 'Log Out'}
        </button>

      </div>
    </main>
  )
}
