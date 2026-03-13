'use server'

import { createServerClientUntyped, getTrainerId } from '@/lib/supabase/server'

export async function completeOnboarding(): Promise<{ error?: string }> {
  const trainerId = await getTrainerId()
  if (!trainerId) return { error: 'Not authenticated' }

  const supabase = await createServerClientUntyped()

  const { error } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', trainerId)

  if (error) return { error: error.message }
  return {}
}
