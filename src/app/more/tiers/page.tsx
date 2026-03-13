import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getTiers } from '@/actions/tiers'
import { TierManagementView } from './tier-management-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function TierManagementPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const tiers = await getTiers()

  return (
    <>
      <TierManagementView tiers={tiers} />
      <BottomNav />
    </>
  )
}
