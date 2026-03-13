'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon, ArrowLeft01Icon, Search01Icon } from '@/components/ui/icon'

type ClientOption = {
  id: string
  name: string
  programs: string[] | null
}

type Props = {
  clients: ClientOption[]
}

export function RecordProgressSelectClient({ clients }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-4 pt-12 pb-6">

        <button onClick={() => router.back()} className="flex items-center gap-2 self-start -ml-2 px-2 py-2 rounded-base active:bg-neutral-200">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="currentColor" className="text-neutral-500" />
          <span className="text-[14px] font-normal text-neutral-500">Back</span>
        </button>

        <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px] -mt-2">
          Record Progress
        </h1>
        <span className="text-[14px] font-normal text-neutral-500 -mt-3">
          Select a client to record progress for
        </span>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon icon={Search01Icon} size={16} color="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-11 w-full rounded-base border border-neutral-200 bg-white pl-9 pr-3 text-[15px] font-normal text-neutral-950 outline-none focus:border-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Client List */}
        <div className="flex flex-col gap-2">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => router.push(`/progress/record/${c.id}`)}
              className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4 w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white text-[13px] font-medium">
                  {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-neutral-950">{c.name}</span>
                  <span className="text-[13px] font-normal text-neutral-500">
                    {c.programs?.join(' · ') ?? 'No programs'}
                  </span>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span className="text-[14px] font-normal text-neutral-400">No clients found</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
