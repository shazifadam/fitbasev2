import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getPaymentHistory } from '@/actions/payments'
import { PaymentHistoryView } from './payment-history-view'

export default async function PaymentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const { id } = await params
  const data = await getPaymentHistory(id)

  if (!data) notFound()

  return <PaymentHistoryView data={data} />
}
