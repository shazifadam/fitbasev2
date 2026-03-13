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

export function PostOnboardingLoader() {
  const [active, setActive] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  // Check flag on mount — runs once when the dashboard page hydrates
  useEffect(() => {
    if (sessionStorage.getItem('fitbase_onboarding_loading') === '1') {
      setActive(true)
      sessionStorage.removeItem('fitbase_onboarding_loading')

      // Dismiss after the page has fully painted + a short buffer
      const timer = setTimeout(() => setActive(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [])

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
