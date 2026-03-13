'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Spinner } from '@/components/ui/spinner'

const loadingMessages = [
  'Setting up your client base...',
  'Warming up the dumbbells...',
  'Counting your future payments...',
  'Stretching the spreadsheets...',
  'Syncing your gains...',
  'Almost there...',
]

function checkFlag() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('fitbase_onboarding_loading') === '1'
}

export function PostOnboardingLoader() {
  // Initialize as true if the flag exists — prevents a flash of dashboard
  const [active, setActive] = useState(checkFlag)
  const [msgIndex, setMsgIndex] = useState(0)

  // Clear flag and set dismiss timer on mount
  useEffect(() => {
    if (!active) return
    sessionStorage.removeItem('fitbase_onboarding_loading')

    // Show all messages through "Stretching the spreadsheets..." then dismiss
    // 4 messages × 1.8s = 7.2s
    const timer = setTimeout(() => setActive(false), 7200)
    return () => clearTimeout(timer)
  }, [active])

  // Rotate messages
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % loadingMessages.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-neutral-950">
      <Spinner className="text-white h-8 w-8" />
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-base font-normal text-neutral-400"
        >
          {loadingMessages[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
