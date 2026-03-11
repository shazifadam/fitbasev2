import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
