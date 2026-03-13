import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getTrainingPrograms } from '@/actions/training-programs'
import { ProgramManagementView } from './program-management-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function ProgramManagementPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const programs = await getTrainingPrograms()

  return (
    <>
      <ProgramManagementView programs={programs} />
      <BottomNav />
    </>
  )
}
