import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SWRProvider } from '@/components/swr-provider'
import { PostOnboardingLoader } from '@/components/post-onboarding-loader'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fitbase',
  description: 'Manage your personal training clients',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fitbase',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f5f5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Blocking script: if the onboarding loader flag is set, inject a
            full-screen overlay BEFORE React hydrates — prevents any dashboard flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem('fitbase_onboarding_loading')==='1'){var d=document.createElement('div');d.id='ob-loader';d.style.cssText='position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;align-items:center;justify-content:center';d.innerHTML='<div style="width:32px;height:32px;border:3px solid #525252;border-top-color:#fff;border-radius:50%;animation:obspin 0.6s linear infinite"></div>';var s=document.createElement('style');s.textContent='@keyframes obspin{to{transform:rotate(360deg)}}';document.head.appendChild(s);document.body.appendChild(d)}}catch(e){}})();`,
          }}
        />
      </head>
      <body><SWRProvider><PostOnboardingLoader />{children}</SWRProvider></body>
    </html>
  )
}
