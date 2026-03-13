import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import { getTrainerProfile } from '@/actions/dashboard'
import { OnboardingFlow } from './onboarding-flow'

export default async function OnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const trainer = await getTrainerProfile()
  const firstName = trainer?.display_name?.split(' ')[0] ?? 'there'

  return <OnboardingFlow trainerName={firstName} />
}
