import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    // Untyped client — types regenerated from live DB via supabase gen types
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* server component */ }
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      await supabase.from('users').upsert({
        auth_id: user.id,
        email: user.email!,
        display_name: user.user_metadata.full_name || user.email!.split('@')[0],
        photo_url: user.user_metadata.avatar_url || null,
      }, { onConflict: 'auth_id' })
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
