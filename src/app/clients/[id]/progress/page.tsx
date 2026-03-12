import { redirect } from 'next/navigation'
import { getProgressHistory } from '@/actions/progress'
import { ProgressHistoryView } from './progress-history-view'

export default async function ProgressHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getProgressHistory(id)
  if (!data) redirect('/clients')

  return <ProgressHistoryView data={data} />
}
