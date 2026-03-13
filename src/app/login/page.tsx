'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col">

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-6">

        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-card border border-neutral-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[28px] font-medium text-neutral-950 tracking-[-0.5px]">Welcome Back</h1>
            <p className="text-[14px] font-normal text-neutral-500">Sign in to continue</p>
          </div>
        </div>

        {/* Sign in card */}
        <div className="w-full max-w-sm flex flex-col gap-6 rounded-base bg-white border border-neutral-200 p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium text-neutral-950">Sign in to your account</h2>
            <p className="text-[14px] font-normal text-neutral-500 leading-relaxed">
              Use your Google account to sign in
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-base bg-white border border-neutral-200 text-[15px] font-medium text-neutral-950 active:bg-neutral-50 transition-colors"
          >
            <span className="text-[18px] font-medium text-[#4285F4]">G</span>
            Continue with Google
          </button>

          <p className="text-[12px] font-normal text-neutral-400 text-center leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="flex items-center justify-center px-6 py-5">
        <span className="text-[11px] font-normal text-neutral-400 text-center">
          &copy; 2026 ShazifAdam. All rights reserved.
        </span>
      </div>
    </main>
  )
}
