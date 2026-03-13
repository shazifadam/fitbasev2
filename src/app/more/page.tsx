import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getTrainerProfileDetail } from '@/actions/profile'
import { MoreView } from './more-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function MorePage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getTrainerProfileDetail()
  if (!profile) redirect('/login')

  return (
    <>
      <MoreView profile={profile} />
      <BottomNav />
    </>
  )
}
