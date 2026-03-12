import { redirect } from 'next/navigation'
import { createServerClientUntyped } from '@/lib/supabase/server'
import { RecordProgressSelectClient } from './record-progress-select-client'

type ClientOption = {
  id: string
  name: string
  programs: string[] | null
}

export default async function RecordProgressPage() {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trainer } = await supabase
    .from('users').select('id').eq('auth_id', user.id).single()
  if (!trainer) redirect('/login')

  const trainerId = (trainer as { id: string }).id

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, training_programs')
    .eq('trainer_id', trainerId)
    .eq('is_archived', false)
    .order('name', { ascending: true })

  const clientOptions: ClientOption[] = (clients ?? []).map((c: unknown) => {
    const client = c as { id: string; name: string; training_programs: string[] | null }
    return {
      id: client.id,
      name: client.name,
      programs: client.training_programs,
    }
  })

  return <RecordProgressSelectClient clients={clientOptions} />
}
