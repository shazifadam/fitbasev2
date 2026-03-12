import { redirect } from 'next/navigation'
import { getTrainerProfileDetail } from '@/actions/profile'
import { ProfileEditView } from './profile-edit-view'

export default async function ProfilePage() {
  const profile = await getTrainerProfileDetail()
  if (!profile) redirect('/login')

  return <ProfileEditView profile={profile} />
}
