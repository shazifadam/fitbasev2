'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, GripVertical } from 'lucide-react'
import type { ClientRow } from '@/actions/clients'

const FILTER_TABS = [
  { label: 'All',     dbValue: '' },
  { label: 'Sun Set', dbValue: 'sunday' },
  { label: 'Sat Set', dbValue: 'saturday' },
  { label: 'Custom',  dbValue: 'custom' },
] as const
type FilterTab = typeof FILTER_TABS[number]['label']


function formatPrograms(programs: string[] | null | undefined): string {
  if (!programs || programs.length === 0) return ''
  return programs.slice(0, 2).join(' · ')
}


type Props = {
  clients: ClientRow[]
  trainerInitials: string
}

export function ClientsView({ clients, trainerInitials }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All')

  const activeDbValue = FILTER_TABS.find(t => t.label === activeFilter)?.dbValue ?? ''

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeDbValue === '' || c.schedule_set === activeDbValue
    return matchesSearch && matchesFilter
  })

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
          <Search size={18} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-[14px] font-normal text-neutral-950 placeholder:text-neutral-400 bg-transparent outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(tab.label)}
              className={[
                'flex items-center justify-center rounded-base px-4 py-2 text-[13px] font-normal transition-colors',
                activeFilter === tab.label
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
            {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Client Cards */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span className="text-[15px] font-normal text-neutral-400">No clients found</span>
            </div>
          )}
          {filtered.map(client => (
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
              <GripVertical size={18} className="text-neutral-300 shrink-0" />
            </button>
          ))}
        </div>

      </div>
    </main>
  )
}
