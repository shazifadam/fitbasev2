import { redirect } from 'next/navigation'
import { getClientDetail, getTiers } from '@/actions/clients'
import { EditClientForm } from './edit-client-form'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [client, tiers] = await Promise.all([
    getClientDetail(id),
    getTiers(),
  ])

  if (!client) redirect('/clients')

  return (
    <EditClientForm
      client={client}
      tiers={tiers}
    />
  )
}
