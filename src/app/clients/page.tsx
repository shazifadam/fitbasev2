import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getClients } from '@/actions/clients'
import { getTrainerProfile } from '@/actions/dashboard'
import { ClientsView } from './clients-view'
import { BottomNav } from '@/components/layout/bottom-nav'

function getInitials(name: string | null): string {
  if (!name) return 'TR'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const params = await searchParams

  const [clients, trainer] = await Promise.all([
    getClients({
      search: params.search || undefined,
      scheduleSet: params.filter || undefined,
    }),
    getTrainerProfile(),
  ])

  return (
    <>
      <ClientsView
        clients={clients}
        trainerInitials={getInitials(trainer?.display_name ?? null)}
        initialSearch={params.search ?? ''}
        initialFilter={params.filter ?? ''}
      />
      <BottomNav />
    </>
  )
}
