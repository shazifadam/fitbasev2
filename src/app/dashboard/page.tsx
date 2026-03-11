import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-neutral-100 pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-medium text-neutral-950 mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-500">MVP 1 — Session flow coming next</p>
      </div>
    </main>
  )
}
