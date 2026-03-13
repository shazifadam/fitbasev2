import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '@/types/supabase'

async function cookieConfig() {
  const cookieStore = await cookies()
  return {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server component — cookie setting is handled by middleware
        }
      },
    },
  }
}

// Typed client — for reads/selects where generated types work correctly
export async function createServerClient() {
  const config = await cookieConfig()
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    config
  )
}

// Untyped client — for mutations where the typed client resolves to `never`
export async function createServerClientUntyped() {
  const config = await cookieConfig()
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    config
  )
}

// ─── Cached trainer ID lookup ────────────────────────────────────────────────
// React cache() deduplicates within a single request — so multiple server
// actions that need the trainer ID share a single DB round-trip.

export const getTrainerId = cache(async (): Promise<string | null> => {
  const supabase = await createServerClientUntyped()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: trainer } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  return (trainer as { id: string } | null)?.id ?? null
})
