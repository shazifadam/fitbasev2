import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getTiers } from '@/actions/clients'
import { AddClientForm } from './add-client-form'

export default async function AddClientPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tiers = await getTiers()

  return <AddClientForm tiers={tiers} />
}
