# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fitbase is a PWA for personal trainers to manage clients, attendance, workouts, payments, and progress.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS + Radix UI primitives
- **Database + Auth:** Supabase (PostgreSQL + Google OAuth via `@supabase/ssr`)
- **Icons:** Lucide React
- **PWA:** next-pwa or Workbox
- **Hosting:** Vercel

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npx supabase db push` — push migrations to Supabase
- `npx supabase migration new <name>` — create new migration
- `npx supabase gen types typescript --local > src/types/supabase.ts` — regen types

## Architecture

**Server Actions pattern:** all Supabase calls are async server actions in `src/actions/`. Components never call Supabase directly.

**File structure:**
```
src/
  actions/       # Server actions (Supabase queries) — e.g. actions/session.ts
  app/           # Next.js App Router pages
  components/    # Reusable components
  lib/           # Supabase client, utilities
  types/         # Generated Supabase types (supabase.ts)
  styles/        # Tailwind theme config
```

**Key pages:**
- `/` — Home dashboard (scheduled/attending/attended/missed client lists)
- `/attending` — Active sessions accordion page
- `/clients/[id]` — Client detail

## Data Model

**Attendance status values:** `scheduled` → `attending` → `attended` | `missed` | `rescheduled`

**Key attendance columns:** `status`, `session_started_at`, `session_ended_at`, `session_workout_id` (FK → workouts, nullable), `exercise_weights` (JSONB)

**`exercise_weights` JSONB shape:**
```json
{
  "exercises": [
    {
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "sets": [
        { "set_number": 1, "weight_kg": 60, "reps": 10, "completed": true }
      ]
    }
  ]
}
```

See `Fitbase_PRD.md` for full flow specs and `Fitbase_Design_Tokens.md` for the complete token reference.

## Design System — STRICT RULES

**Border radius:**
- `4px` (`rounded` / `base`) — ALL buttons, inputs, badges, tags, chips, toasts
- `12px` (`rounded-card`) — cards, containers, modals, drawers (outer shell)
- `full` — avatars, FAB, set-number circles, completion checkboxes

**Typography (Inter only):**
- `font-medium` (500) — headings (`h1`–`h6`), section subheadings, card titles
- `font-normal` (400) — everything else (body, labels, buttons, badges, inputs)
- **Never use `font-semibold` (600) or `font-bold` (700)**

**Colors:**
- Primary action buttons: `neutral-800` (#262626)
- FAB only: `pink-800` (#9d174d) — no other pink usage anywhere
- Page background: `neutral-100` (#f5f5f5)
- Cards/inputs: `white`

**Tailwind config tokens** (in `tailwind.config.ts`):
```ts
borderRadius: { base: '0.25rem', card: '0.75rem', full: '9999px' }
fontWeight:   { normal: '400', medium: '500' }
```

Full color palette and semantic tokens are in `Fitbase_Design_Tokens.md`.

## Session Flow (Core Feature)

1. Trainer taps **⋮** on a client card → bottom drawer opens
2. Drawer actions: **Start Session** | Mark Absent | Reschedule
3. Start Session → workout selection drawer (optional, can skip)
4. On start: attendance status → `attending`, `session_started_at` set
5. Trainer goes to `/attending` → accordion per active client with exercise tracking
6. Complete Session → status → `attended`, `exercise_weights` saved, `session_ended_at` set

## Current State

**MVP 0 — Complete ✓**
- Next.js 15 + TypeScript + Tailwind v3 scaffolded, `npm run build` passes
- Design tokens locked in `tailwind.config.ts` (radius, colors, font weights)
- shadcn/ui base components created: `Button`, `Input`, `Badge`, `Card`, `Avatar`, `Dialog`, `BottomDrawer`
- Supabase clients: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (RSC)
- Auth middleware + Google OAuth callback at `/auth/callback`
- DB migrations: `supabase/migrations/` — all 8 tables (users, tiers, clients, exercises, workouts, workout_exercises, attendance, payments, progress)
- Placeholder TypeScript types in `src/types/supabase.ts` — **regenerate after connecting to Supabase**
- Bottom nav component at `src/components/layout/bottom-nav.tsx`

**Next: MVP 1 — Session Flow** (`mvp/1-session-flow` branch)
- Connect to Supabase project + set `.env.local` + run `npx supabase db push`
- Regenerate types: `npx supabase gen types typescript --local > src/types/supabase.ts`
- Build `SessionActionDrawer` (section 1.3 of `Fitbase_PRD.md`)
- Build workout selection view (section 1.4)
- Build `/attending` accordion page (section 1.5)
