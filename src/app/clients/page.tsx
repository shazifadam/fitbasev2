import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getClients } from '@/actions/clients'
import { getTrainerProfile } from '@/actions/dashboard'
import { ClientsView } from './clients-view'
import { BottomNav } from '@/components/layout/bottom-nav'

function getInitials(name: string | null): string {
  if (!name) return 'TR'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default async function ClientsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [clients, trainer] = await Promise.all([
    getClients(),
    getTrainerProfile(),
  ])

  return (
    <>
      <ClientsView
        clients={clients}
        trainerInitials={getInitials(trainer?.display_name ?? null)}
      />
      <BottomNav />
    </>
  )
}
