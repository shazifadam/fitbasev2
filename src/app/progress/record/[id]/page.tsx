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
  const client = await getClientDetail(id)
  if (!client) redirect('/progress/record')

  const previous = await getPreviousMeasurement(id)

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
