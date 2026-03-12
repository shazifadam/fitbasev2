'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown01Icon, ArrowLeft01Icon } from 'hugeicons-react'
import { Spinner } from '@/components/ui/spinner'
import { updateClient, type ClientDetail, type TierRow } from '@/actions/clients'

// ─── Constants ────────────────────────────────────────────────────────────────

const TRAINING_PROGRAMS = ['Strength', 'Body-Trans', 'Cardio', 'HIIT']

const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type ScheduleOption = 'Sun Set' | 'Sat Set' | 'Custom'

const SCHEDULE_CONFIG: Record<ScheduleOption, { dbValue: 'sunday' | 'saturday' | 'custom'; days: string[] }> = {
  'Sun Set': { dbValue: 'sunday',   days: ['Sun', 'Tue', 'Thu'] },
  'Sat Set': { dbValue: 'saturday', days: ['Sat', 'Mon', 'Wed'] },
  'Custom':  { dbValue: 'custom',   days: [] },
}

const DB_TO_SCHEDULE: Record<string, ScheduleOption> = {
  sunday: 'Sun Set',
  saturday: 'Sat Set',
  custom: 'Custom',
}

const DEFAULT_TIME = '06:00'

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  client: ClientDetail
  tiers: TierRow[]
}

export function EditClientForm({ client, tiers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const initialSchedule = DB_TO_SCHEDULE[client.schedule_set] ?? 'Sun Set'
  const initialTimes = (client.session_times ?? {}) as Record<string, string>

  const [name, setName]               = useState(client.name)
  const [phone, setPhone]             = useState(client.phone ?? '')
  const [programs, setPrograms]       = useState<string[]>(client.training_programs ?? [])
  const [tierId, setTierId]           = useState(client.tier_id ?? '')
  const [scheduleSet, setScheduleSet] = useState<ScheduleOption>(initialSchedule)
  const [customDays, setCustomDays]   = useState<string[]>(client.custom_days ?? [])
  const [sessionTimes, setSessionTimes] = useState<Record<string, string>>(initialTimes)
  const [error, setError] = useState<string | null>(null)

  const activeDays = scheduleSet === 'Custom' ? customDays : SCHEDULE_CONFIG[scheduleSet].days

  function handleScheduleSetChange(val: ScheduleOption) {
    setScheduleSet(val)
    if (val !== 'Custom') {
      const newDays = SCHEDULE_CONFIG[val].days
      const times: Record<string, string> = {}
      newDays.forEach(d => { times[d] = sessionTimes[d] ?? DEFAULT_TIME })
      setSessionTimes(times)
    }
  }

  function toggleCustomDay(day: string) {
    setCustomDays(prev => {
      const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      if (!prev.includes(day)) {
        setSessionTimes(t => ({ ...t, [day]: t[day] ?? DEFAULT_TIME }))
      }
      return next
    })
  }

  function handleTimeChange(day: string, value: string) {
    setSessionTimes(prev => ({ ...prev, [day]: value }))
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^\d+\s]/g, '')
    setPhone(val)
  }

  function handleSubmit() {
    if (!name.trim())           { setError('Client name is required'); return }
    if (!phone.trim())          { setError('Phone number is required'); return }
    if (programs.length === 0)  { setError('Select at least one training program'); return }
    if (scheduleSet === 'Custom' && customDays.length === 0) {
      setError('Select at least one day for the custom schedule'); return
    }
    setError(null)

    startTransition(async () => {
      const result = await updateClient(client.id, {
        name: name.trim(),
        phone: phone.trim(),
        training_programs: programs,
        tier_id: tierId || null,
        schedule_set: SCHEDULE_CONFIG[scheduleSet].dbValue,
        custom_days: scheduleSet === 'Custom' ? customDays : [],
        session_times: sessionTimes,
      })
      if (result.error) setError(result.error)
      else router.push(`/clients/${client.id}`)
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 pb-8">
      <div className="flex flex-col gap-6 px-6 pt-12 pb-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-neutral-950" aria-label="Go back">
            <ArrowLeft01Icon size={24} color="currentColor" />
          </button>
          <h1 className="text-[28px] font-medium text-neutral-950 leading-tight tracking-[-0.5px]">
            Edit Client
          </h1>
        </div>

        {/* Form Card */}
        <div className="flex flex-col gap-5 rounded-base bg-white border border-neutral-200 p-6">

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-neutral-950">Client Name</label>
            <input
              type="text"
              placeholder="Enter client name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 rounded-base border border-neutral-200 px-[14px] text-[14px] font-normal text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-800 bg-white"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-neutral-950">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="+966 5XX XXX XXXX"
              value={phone}
              onChange={handlePhoneChange}
              className="h-12 rounded-base border border-neutral-200 px-[14px] text-[14px] font-normal text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-800 bg-white"
            />
          </div>

          {/* Training Programs */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-neutral-950">Training Programs</label>
            <div className="flex flex-wrap gap-2">
              {TRAINING_PROGRAMS.map(program => {
                const selected = programs.includes(program)
                return (
                  <button
                    key={program}
                    type="button"
                    onClick={() => setPrograms(prev =>
                      prev.includes(program) ? prev.filter(p => p !== program) : [...prev, program]
                    )}
                    className={[
                      'rounded-base px-[14px] py-2 text-[13px] font-normal transition-colors',
                      selected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-950',
                    ].join(' ')}
                  >
                    {program}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Membership Tier */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-neutral-950">Membership Tier</label>
            <div className="relative">
              <select
                value={tierId}
                onChange={e => setTierId(e.target.value)}
                className="w-full h-12 appearance-none rounded-base border border-neutral-200 px-[14px] text-[14px] font-normal text-neutral-950 bg-white outline-none focus:border-neutral-800 pr-10"
              >
                <option value="">Select tier</option>
                {tiers.map(tier => (
                  <option key={tier.id} value={tier.id}>{tier.name}</option>
                ))}
              </select>
              <ArrowDown01Icon size={18} color="currentColor" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Schedule Set */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-neutral-950">Schedule Set</label>
            <div className="flex flex-col gap-2.5">
              {(Object.keys(SCHEDULE_CONFIG) as ScheduleOption[]).map(option => {
                const selected = scheduleSet === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleScheduleSetChange(option)}
                    className="flex items-center gap-2.5 text-left"
                  >
                    <div className={[
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      selected ? 'border-2 border-neutral-800' : 'border-[1.5px] border-neutral-300',
                    ].join(' ')}>
                      {selected && <div className="h-2 w-2 rounded-full bg-neutral-800" />}
                    </div>
                    <span className="text-[14px] font-normal text-neutral-950">{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom day checkboxes */}
            {scheduleSet === 'Custom' && (
              <div className="mt-2 flex flex-wrap gap-2">
                {ALL_DAYS.map(day => {
                  const checked = customDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleCustomDay(day)}
                      className={[
                        'rounded-base px-3 py-1.5 text-[13px] font-normal transition-colors',
                        checked ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-950',
                      ].join(' ')}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Session Times */}
          {activeDays.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-neutral-950">Session Times</label>
              <div className="flex flex-col gap-2">
                {activeDays.map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-9 text-[14px] font-medium text-neutral-950 shrink-0">{day}</span>
                    <input
                      type="time"
                      value={sessionTimes[day] ?? DEFAULT_TIME}
                      onChange={e => handleTimeChange(day, e.target.value)}
                      className="flex-1 h-11 rounded-base border border-neutral-200 px-[14px] text-[14px] font-normal text-neutral-950 outline-none focus:border-neutral-800 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] font-normal text-danger-600 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-base bg-neutral-800 text-[15px] font-normal text-white disabled:opacity-50"
        >
          {isPending ? <><Spinner className="text-white" /> Saving…</> : 'Save Changes'}
        </button>

      </div>
    </main>
  )
}
