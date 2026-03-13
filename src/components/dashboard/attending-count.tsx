'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initialCount: number
  trainerId: string
  date: string
}

export function AttendingCount({ initialCount, trainerId, date }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('attending-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `trainer_id=eq.${trainerId}`,
        },
        () => {
          // Re-fetch count on any attendance change
          supabase
            .from('attendance')
            .select('id', { count: 'exact', head: true })
            .eq('trainer_id', trainerId)
            .eq('status', 'attending')
            .eq('scheduled_date', date)
            .then(({ count: c }) => setCount(c ?? 0))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trainerId, date])

  return (
    <span className="text-[13px] font-medium text-white">
      {count} attending
    </span>
  )
}
