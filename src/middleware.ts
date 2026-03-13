import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Onboarding redirect — read onboarding_completed from JWT claim (no DB call)
  if (user) {
    let onboardingCompleted = true // default to true (safe fallback)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const payload = JSON.parse(atob(session.access_token.split('.')[1]))
        onboardingCompleted = payload.onboarding_completed === true
      }
    } catch {
      // JWT decode failed — skip onboarding check
    }

    if (!onboardingCompleted && !pathname.startsWith('/onboarding') && !isPublicRoute) {
      const onboardingUrl = request.nextUrl.clone()
      onboardingUrl.pathname = '/onboarding'
      return NextResponse.redirect(onboardingUrl)
    }

    if (onboardingCompleted && pathname.startsWith('/onboarding')) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
