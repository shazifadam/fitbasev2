import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getTiers } from '@/actions/tiers'
import { TierManagementView } from './tier-management-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function TierManagementPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tiers = await getTiers()

  return (
    <>
      <TierManagementView tiers={tiers} />
      <BottomNav />
    </>
  )
}
