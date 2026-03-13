import { redirect } from 'next/navigation'
import { getClientDetail, getTiers } from '@/actions/clients'
import { getTrainingPrograms } from '@/actions/training-programs'
import { EditClientForm } from './edit-client-form'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [client, tiers, trainingPrograms] = await Promise.all([
    getClientDetail(id),
    getTiers(),
    getTrainingPrograms(),
  ])

  if (!client) redirect('/clients')

  return (
    <EditClientForm
      client={client}
      tiers={tiers}
      trainingPrograms={trainingPrograms}
    />
  )
}
