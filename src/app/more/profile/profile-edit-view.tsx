'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon, ArrowLeft01Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { updateTrainerProfile } from '@/actions/profile'
import type { TrainerProfileDetail } from '@/actions/profile'

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  profile: TrainerProfileDetail
}

export function ProfileEditView({ profile }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const initials = profile.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function handleSave() {
    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await updateTrainerProfile({ display_name: displayName })
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.refresh()
      }
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-6 pb-6">

        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 self-start -ml-2 px-2 py-2 rounded-base active:bg-neutral-200">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" className="text-neutral-500" />
          <span className="text-[14px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Edit Profile
        </h1>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-white text-2xl font-medium">
            {initials}
          </div>
          <span className="text-[13px] font-normal text-neutral-500">{profile.email}</span>
        </div>

        {/* Display Name */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[14px] font-normal text-neutral-950">Display Name</span>
          <input
            type="text"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setSuccess(false) }}
            placeholder="Your name"
            className="h-11 rounded-base border border-neutral-200 px-3 text-[15px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[14px] font-normal text-neutral-950">Email</span>
          <div className="flex h-11 items-center rounded-base border border-neutral-200 bg-neutral-50 px-3 text-[15px] font-normal text-neutral-500">
            {profile.email}
          </div>
          <span className="text-[12px] font-normal text-neutral-400">
            Email is managed by your Google account
          </span>
        </div>

        {/* Error / Success */}
        {error && (
          <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
        )}
        {success && (
          <p className="text-[13px] font-normal text-success-600 text-center">Profile updated</p>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
        >
          {isPending ? <><Spinner className="text-white" /> Saving…</> : 'Save Changes'}
        </button>

      </div>
    </main>
  )
}
