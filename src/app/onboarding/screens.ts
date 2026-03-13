export type OnboardingScreen = {
  title: string | ((name: string) => string)
  description: string
  iconName: string
  ctaLabel: string
  showSkip: boolean
  darkVisual?: boolean
}

export const screens: OnboardingScreen[] = [
  // Screen 0 — Welcome
  {
    title: (name: string) => `Hey ${name}, welcome to Fitbase! 👋`,
    description:
      'Your clients, sessions, payments, and progress — all in one place. Let\u2019s take a quick look at what you can do.',
    iconName: 'celebration',
    ctaLabel: 'Let\u2019s go \u2192',
    showSkip: false,
  },
  // Screen 1 — Client Management
  {
    title: 'All your clients, one tap away.',
    description:
      'Add clients with their schedule, training programs, and tier. Fitbase automatically tracks their membership status so you always know who\u2019s active, expiring, or overdue.',
    iconName: 'clients',
    ctaLabel: 'Nice, continue \u2192',
    showSkip: true,
  },
  // Screen 2 — Attendance & Sessions
  {
    title: 'Running sessions has never been simpler.',
    description:
      'Each morning, your scheduled clients appear on your home screen. Tap the menu on any card to start a session, mark them absent, or reschedule — all in one tap.',
    iconName: 'sessions',
    ctaLabel: 'Got it \u2192',
    showSkip: true,
  },
  // Screen 3 — Workout Tracking
  {
    title: 'Track every rep, every set.',
    description:
      'During a session, log weights set by set. Fitbase remembers the previous session\u2019s weights automatically, so you can always push your clients to beat their personal best.',
    iconName: 'workouts',
    ctaLabel: 'Love it \u2192',
    showSkip: true,
  },
  // Screen 4 — Payments & Progress
  {
    title: 'Payments and progress, always in sync.',
    description:
      'Record monthly payments and track body metrics like weight, waist, and body fat. Fitbase calculates membership status automatically and shows your clients\u2019 transformation over time.',
    iconName: 'payments',
    ctaLabel: 'One more thing \u2192',
    showSkip: true,
  },
  // Screen 5 — Stats & Ready
  {
    title: 'Your business, at a glance.',
    description:
      'The Stats page gives you a monthly snapshot — income, attendance rates, and client growth. All from your real data, updated as you work.',
    iconName: 'stats',
    ctaLabel: 'Let\u2019s get started 🎉',
    showSkip: false,
    darkVisual: true,
  },
]
