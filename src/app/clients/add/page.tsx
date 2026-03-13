import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getTiers } from '@/actions/clients'
import { getTrainingPrograms } from '@/actions/training-programs'
import { AddClientForm } from './add-client-form'

export default async function AddClientPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [tiers, trainingPrograms] = await Promise.all([
    getTiers(),
    getTrainingPrograms(),
  ])

  return <AddClientForm tiers={tiers} trainingPrograms={trainingPrograms} />
}
