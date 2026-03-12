import { redirect } from 'next/navigation'
import { getClientDetail, getTiers } from '@/actions/clients'
import { EditClientForm } from './edit-client-form'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClientDetail(id)
  if (!client) redirect('/clients')

  const tiers = await getTiers()

  return (
    <EditClientForm
      client={client}
      tiers={tiers}
    />
  )
}
