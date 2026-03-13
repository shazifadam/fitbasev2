'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HugeiconsIcon, Search01Icon, DragDropVerticalIcon } from '@/components/ui/icon'
import type { ClientRow } from '@/actions/clients'

const FILTER_TABS = [
  { label: 'All',     dbValue: '' },
  { label: 'Sun Set', dbValue: 'sunday' },
  { label: 'Sat Set', dbValue: 'saturday' },
  { label: 'Custom',  dbValue: 'custom' },
] as const

function formatPrograms(programs: string[] | null | undefined): string {
  if (!programs || programs.length === 0) return ''
  return programs.slice(0, 2).join(' · ')
}

type Props = {
  clients: ClientRow[]
  trainerInitials: string
  initialSearch: string
  initialFilter: string
}

export function ClientsView({ clients, trainerInitials, initialSearch, initialFilter }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeFilter = initialFilter

  const updateURL = useCallback((newSearch: string, newFilter: string) => {
    const params = new URLSearchParams()
    if (newSearch) params.set('search', newSearch)
    if (newFilter) params.set('filter', newFilter)
    const qs = params.toString()
    router.replace(`/clients${qs ? `?${qs}` : ''}`)
  }, [router])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateURL(value, activeFilter)
    }, 300)
  }, [activeFilter, updateURL])

  const handleFilterChange = useCallback((dbValue: string) => {
    updateURL(search, dbValue)
  }, [search, updateURL])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <main className="min-h-screen bg-neutral-100 pb-24">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-normal text-neutral-500">All Clients</span>
            <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
              Manage Clients
            </h1>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white text-base font-medium">
            {trainerInitials}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 h-11 px-3 bg-white rounded-base border border-neutral-200">
          <HugeiconsIcon icon={Search01Icon} size={18} color="currentColor" className="text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="flex-1 text-[14px] font-normal text-neutral-950 placeholder:text-neutral-400 bg-transparent outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.label}
              onClick={() => handleFilterChange(tab.dbValue)}
              className={[
                'flex items-center justify-center rounded-base px-4 py-2 text-[13px] font-normal transition-colors',
                activeFilter === tab.dbValue
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-200 text-neutral-950',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-neutral-950">Client List</span>
          <span className="text-[13px] font-normal text-neutral-500">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Client Cards */}
        <div className="flex flex-col gap-2">
          {clients.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span className="text-[15px] font-normal text-neutral-400">No clients found</span>
            </div>
          )}
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="flex items-center justify-between rounded-base bg-white border border-neutral-200 p-4 w-full text-left"
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-neutral-950">{client.name}</span>
                <span className="text-[13px] font-normal text-neutral-500">
                  {formatPrograms(client.training_programs)}
                </span>
                <div className="flex items-center gap-2">
                  {client.schedule_set && (
                    <span className="rounded-base bg-neutral-100 px-2 py-1 text-[13px] font-normal text-neutral-600">
                      {client.schedule_set}
                    </span>
                  )}
                </div>
              </div>
              <HugeiconsIcon icon={DragDropVerticalIcon} size={18} color="currentColor" className="text-neutral-300 shrink-0" />
            </button>
          ))}
        </div>

      </div>
    </main>
  )
}
