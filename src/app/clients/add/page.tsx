import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getTiers } from '@/actions/clients'
import { getTrainingPrograms } from '@/actions/training-programs'
import { AddClientForm } from './add-client-form'

export default async function AddClientPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const [tiers, trainingPrograms] = await Promise.all([
    getTiers(),
    getTrainingPrograms(),
  ])

  return <AddClientForm tiers={tiers} trainingPrograms={trainingPrograms} />
}
