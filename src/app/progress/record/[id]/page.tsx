import { redirect } from 'next/navigation'
import { getClientDetail } from '@/actions/clients'
import { getPreviousMeasurement } from '@/actions/progress'
import { RecordProgressForm } from './record-progress-form'

export default async function RecordProgressFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [client, previous] = await Promise.all([
    getClientDetail(id),
    getPreviousMeasurement(id),
  ])

  if (!client) redirect('/progress/record')

  return (
    <RecordProgressForm
      client={{
        id: client.id,
        name: client.name,
        programs: client.training_programs,
      }}
      previous={previous}
    />
  )
}
