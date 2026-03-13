'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon, UserGroupIcon, Calendar01Icon, Dumbbell01Icon, Money01Icon, BarChartIcon, CheckmarkCircle01Icon } from '@/components/ui/icon'
import { completeOnboarding } from '@/actions/onboarding'
import { createClient } from '@/lib/supabase/client'
import { screens } from './screens'

// ─── Icon map ────────────────────────────────────────────────────────────────

const iconMap: Record<string, typeof UserGroupIcon> = {
  celebration: CheckmarkCircle01Icon,
  clients: UserGroupIcon,
  sessions: Calendar01Icon,
  workouts: Dumbbell01Icon,
  payments: Money01Icon,
  stats: BarChartIcon,
}

// ─── Swipe threshold ─────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 50

// ─── Component ───────────────────────────────────────────────────────────────

type Props = { trainerName: string }

export function OnboardingFlow({ trainerName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPending, startTransition] = useTransition()

  const screen = screens[step]
  const title = typeof screen.title === 'function' ? screen.title(trainerName) : screen.title
  const isDark = screen.darkVisual ?? false
  const iconData = iconMap[screen.iconName]

  function goTo(next: number, dir: number) {
    if (next < 0 || next > screens.length - 1) return
    setDirection(dir)
    setStep(next)
  }

  function handleContinue() {
    if (step < screens.length - 1) {
      goTo(step + 1, 1)
    } else {
      // Final screen — complete onboarding
      startTransition(async () => {
        await completeOnboarding()
        // Refresh JWT so middleware sees onboarding_completed = true
        const supabase = createClient()
        await supabase.auth.refreshSession()
        router.push('/dashboard')
      })
    }
  }

  function handleSkip() {
    goTo(screens.length - 1, 1)
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -SWIPE_THRESHOLD && step < screens.length - 1) {
      goTo(step + 1, 1)
    } else if (info.offset.x > SWIPE_THRESHOLD && step > 0) {
      goTo(step - 1, -1)
    }
  }

  // ─── Animation variants ──────────────────────────────────────────────────

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-neutral-100 overflow-hidden">

      {/* Visual Zone — 55% */}
      <div className="relative flex-[55] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={[
              'absolute inset-0 flex items-center justify-center',
              isDark ? 'bg-neutral-950' : 'bg-neutral-50',
            ].join(' ')}
          >
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div
                className={[
                  'flex h-32 w-32 items-center justify-center rounded-card',
                  isDark ? 'bg-neutral-800' : 'bg-white shadow-sm',
                ].join(' ')}
              >
                {iconData && (
                  <HugeiconsIcon
                    icon={iconData}
                    size={64}
                    color={isDark ? '#ffffff' : '#262626'}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Zone — 30% */}
      <div className="flex-[30] px-6 pt-8 pb-2 flex flex-col gap-3">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={step}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            <h1 className="text-2xl font-medium text-neutral-950">{title}</h1>
            <p className="text-base font-normal text-neutral-500 leading-relaxed">
              {screen.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Zone — 15% */}
      <div className="flex-[15] px-6 pb-8 flex flex-col justify-end gap-3">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {screens.map((_, i) => (
            <div
              key={i}
              className={[
                'h-2 w-2 rounded-full transition-colors duration-300',
                i === step ? 'bg-neutral-800' : 'bg-neutral-300',
              ].join(' ')}
              aria-label={`Step ${i + 1} of ${screens.length}`}
            />
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={isPending}
          className="flex h-[52px] w-full items-center justify-center rounded-base bg-neutral-800 text-base font-normal text-white disabled:opacity-50"
        >
          {isPending ? 'Loading\u2026' : screen.ctaLabel}
        </button>

        {/* Skip link */}
        {screen.showSkip && (
          <button
            onClick={handleSkip}
            className="flex h-10 w-full items-center justify-center text-[13px] font-normal text-neutral-400"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  )
}
