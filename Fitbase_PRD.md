# Fitbase PRD — Amended Flow & Tech Stack
## Supplement to Fitbase_PRD_Supabase_Final.md

**Version:** 1.1-amendment
**Date:** March 11, 2026
**Author:** Shazif Adam / Encrea Studio

---

## Amendment 1: Revised Attendance & Session Flow

This amendment replaces the previous attendance marking workflow. The new flow introduces a drawer-based action model triggered from the client card, an optional workout selection step, a dedicated Attending page with accordion-based exercise tracking, and a clear pipeline from scheduled → attending → attended.

---

### 1.1 Home Dashboard — Revised Layout

The home dashboard retains its structure but the dark summary card at the top is renamed and repurposed.

**Attending Card** (replaces "Clients for the day")

The near-black card at the top of the dashboard now reads "Attending" with a count of clients currently in an active session. This count updates in real time as trainers start and complete sessions.

```
┌──────────────────────────────────────────┐
│  Attending                    3 clients  │  ← neutral.800 bg, white text
└──────────────────────────────────────────┘
```

- **Label:** "Attending" (Inter Medium, `sm`, `fg.inverted`)
- **Count badge:** "{n} clients" (Inter Regular, white bg on dark, `borderRadius="full"`)
- **Tap action:** Navigates to `/attending` page
- The card is only visible when at least one client is attending. When zero clients are attending, the card is hidden.

Below the Attending Card, the day's scheduled client cards are listed as before.

---

### 1.2 Client Card — More Button Action

Each client card on the home dashboard has a **more button** (three-dot `MoreVertical` icon) on the right side. Tapping this button opens a **bottom drawer** with session actions.

**Client Card Layout:**

```
┌────────────────────────────────────────────┐
│  [Avatar]  Ahmed Ali              [⋮]      │
│            Strength · Body-Trans           │
│            9:00 AM                         │
└────────────────────────────────────────────┘
```

- The `[⋮]` (MoreVertical) icon is the trigger for the action drawer.
- Tapping anywhere else on the card navigates to the client detail page (existing behaviour).

---

### 1.3 Session Action Drawer

When the trainer taps the more button on a client card, a bottom drawer slides up with three actions:

```
┌──────────────────────────────────────────────┐
│  ─── (handle bar)                            │
│                                              │
│  Ahmed Ali                                   │
│  Strength · Body-Trans                       │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ▶  Start Session                      │  │  ← Primary button (neutral.800)
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ✕  Mark as Absent                     │  │  ← Secondary button (neutral.100)
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ↻  Reschedule                         │  │  ← Secondary button (neutral.100)
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

**Drawer Specifications:**

- **Outer radius:** `md` (12px) on top-left and top-right corners
- **Handle bar:** 40px wide, `neutral.300`, `borderRadius="full"`, centered at top
- **Overlay:** `rgba(0,0,0,0.4)`
- **Client name:** Inter Medium, `lg`
- **Program tags:** Below name, using existing tag tokens
- **Buttons:** Full width, `borderRadius="base"` (4px), stacked with `gap="3"`

**Action Behaviours:**

| Action | Icon | Button Style | Result |
|--------|------|-------------|--------|
| Start Session | `Play` | Primary (neutral.800 bg) | Opens workout selection, then moves client to attending state |
| Mark as Absent | `X` | Secondary (neutral.100 bg) | Sets attendance status to `missed`, client card moves to "Missed" section on dashboard |
| Reschedule | `RefreshCw` | Secondary (neutral.100 bg) | Opens date/time picker, creates rescheduled record |

---

### 1.4 Workout Selection (After "Start Session")

When the trainer taps **Start Session**, the drawer transitions to a workout selection view. This step is **optional** — the trainer can skip it and start a session without a pre-built workout.

**Workout Selection View:**

```
┌──────────────────────────────────────────────┐
│  ─── (handle bar)                            │
│                                              │
│  Select Workout                              │  ← Inter Medium, xl
│  Choose a workout for this session           │  ← Inter Regular, sm, fg.muted
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Upper Body A                          │  │  ← Card, borderRadius md
│  │  Bench Press, Row, Pull-ups + 2 more   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Lower Body B                          │  │
│  │  Squat, Deadlift, Lunges              │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Skip — Start without workout          │  │  ← Ghost button
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

**Specifications:**

- The workout list is pulled from the `workouts` table filtered by `client_id`.
- Each workout card shows the workout name (Inter Medium) and a comma-separated preview of exercise names (Inter Regular, `fg.muted`, max 1 line with "+N more" truncation).
- Tapping a workout card selects it and immediately starts the session.
- The "Skip" button at the bottom starts the session with no workout attached.
- If the client has no workouts assigned, this view shows an empty state: "No workouts assigned. You can add exercises during the session." with a single "Start Session" primary button.

**On workout selection or skip:**

1. Attendance record status updates from `scheduled` → `attending` (new status value).
2. A `session_workout_id` field is set on the attendance record (nullable — null if skipped).
3. The client card on the home dashboard visually transitions to an "attending" state (not shown on scheduled list anymore).
4. The Attending Card count increments by 1.
5. The drawer closes.

---

### 1.5 Attending Page (`/attending`)

The trainer navigates to the Attending page by tapping the **Attending Card** on the home dashboard. This page shows all clients currently in an active session.

**Page Header:**

```
← Attending                          [3 clients]
```

- Back arrow navigates to home dashboard.
- Client count badge on the right.

**Client List — Accordion Layout:**

Each attending client is displayed as a **collapsed accordion item**. The accordion allows the trainer to expand one client at a time to view and interact with their workout.

**Collapsed State:**

```
┌────────────────────────────────────────────┐
│  [Avatar]  Ahmed Ali           32:15  [v]  │
│            Strength · Body-Trans           │
└────────────────────────────────────────────┘
```

- Avatar, name (Inter Medium), duration timer, and chevron indicator.
- Training program tags below the name.
- Timer shows elapsed time since session start (`HH:MM` or `MM:SS` if under 1 hour).

**Expanded State:**

When the trainer taps a client accordion, it expands to reveal the workout exercises.

```
┌────────────────────────────────────────────┐
│  [Avatar]  Ahmed Ali           32:15  [^]  │
│            Strength · Body-Trans           │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  CURRENT EXERCISE          2 of 4  │    │
│  │                                    │    │
│  │  Bench Press                       │    │  ← Inter Medium, lg
│  │  4 sets × 10 reps · Target: 60 kg │    │  ← Inter Regular, sm, fg.muted
│  │                                    │    │
│  │  Set  Previous  Weight(kg)  Done   │    │
│  │  (1)   55 kg    [  60  ]    [✓]    │    │  ← Set circle: full, input: base (4px)
│  │  (2)   55 kg    [  58  ]    [ ]    │    │
│  │  (3)   50 kg    [  —   ]    [ ]    │    │
│  │  (4)   50 kg    [  —   ]    [ ]    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  UP NEXT                                   │
│  ┌────────────────────────────────────┐    │
│  │  Pull-ups                     [>]  │    │
│  │  3 sets × 8 reps                   │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  Complete Session                  │    │  ← Primary button (neutral.800)
│  └────────────────────────────────────┘    │
│                                            │
└────────────────────────────────────────────┘
```

**Exercise Tracking Specifications:**

- **Section label** "CURRENT EXERCISE" uses Inter Medium, `xs`, uppercase, `fg.muted`.
- **Exercise name** uses Inter Medium, `lg`.
- **Set/rep info** uses Inter Regular, `sm`, `fg.muted`.
- **Set number circles** use `borderRadius="full"`. Completed sets have a filled dark circle; pending sets have an outlined circle.
- **Weight input fields** use `borderRadius="base"` (4px). The active input has an orange/highlight border (from the screenshot: `#e87040` or use `warning.600`).
- **Previous column** shows the weight from the last session for the same exercise (Inter Regular, `sm`, `fg.muted`).
- **Done checkbox** is a circle (`borderRadius="full"`). When checked, it fills with `success.600` and shows a white check icon.
- The **"UP NEXT"** section shows upcoming exercises in a compact card list.
- If no workout was selected (skip), the expanded view shows an "Add Exercise" button that opens the exercise search/add flow inline.

**Complete Session:**

When the trainer taps **Complete Session**:

1. Attendance record status updates from `attending` → `attended`.
2. All weight data is saved to the attendance record's `exercise_weights` JSONB field.
3. The client accordion collapses and shows a completion indicator.
4. The client card moves to the "Attended" section on the home dashboard.
5. The Attending Card count decrements by 1.

If all exercises are not marked done, a confirmation dialog appears: "Not all exercises are completed. Complete session anyway?" with "Cancel" and "Complete" buttons.

---

### 1.6 Home Dashboard Sections (Revised)

The home dashboard now has three distinct sections below the Attending Card:

| Section | Content | Status Filter |
|---------|---------|---------------|
| **Scheduled** | Clients with sessions today who have not started | `status = 'scheduled'` |
| **Attended** | Clients who completed their session today | `status = 'attended'` |
| **Missed** | Clients marked as absent today | `status = 'missed'` |

Each section has a header label (Inter Medium, `sm`, uppercase) and a count. Sections with zero clients are hidden.

---

### 1.7 Database Changes

**New attendance status value:**

```sql
-- Amend the status CHECK constraint on attendance table
ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_status_check;

ALTER TABLE attendance
  ADD CONSTRAINT attendance_status_check
  CHECK (status IN ('scheduled', 'attending', 'attended', 'missed', 'rescheduled'));
```

**New columns on attendance:**

```sql
ALTER TABLE attendance
  ADD COLUMN session_started_at TIMESTAMPTZ,
  ADD COLUMN session_ended_at TIMESTAMPTZ,
  ADD COLUMN session_workout_id UUID REFERENCES workouts(id),
  ADD COLUMN exercise_weights JSONB DEFAULT '{}';
```

**`exercise_weights` JSONB structure:**

```json
{
  "exercises": [
    {
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "sets": [
        { "set_number": 1, "weight_kg": 60, "reps": 10, "completed": true },
        { "set_number": 2, "weight_kg": 58, "reps": 10, "completed": true },
        { "set_number": 3, "weight_kg": 55, "reps": 8, "completed": false },
        { "set_number": 4, "weight_kg": 0, "reps": 0, "completed": false }
      ]
    }
  ]
}
```

---

### 1.8 Server Actions (New/Amended)

```typescript
// actions/session.ts

export async function startSession(
  attendanceId: string,
  workoutId?: string
) {
  const { data, error } = await supabase
    .from('attendance')
    .update({
      status: 'attending',
      session_started_at: new Date().toISOString(),
      session_workout_id: workoutId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attendanceId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeSession(
  attendanceId: string,
  exerciseWeights: object
) {
  const { data, error } = await supabase
    .from('attendance')
    .update({
      status: 'attended',
      session_ended_at: new Date().toISOString(),
      exercise_weights: exerciseWeights,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attendanceId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markAbsent(attendanceId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .update({
      status: 'missed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', attendanceId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Amendment 2: Tech Stack — Cost-Effective Recommendation

The current PRD specifies React + Chakra UI v3 + Next.js + Supabase + Vercel. Here is an optimised assessment and recommendation.

---

### 2.1 Current Stack Assessment

| Layer | Current Choice | Monthly Cost (est.) | Verdict |
|-------|---------------|-------------------|---------|
| Frontend Framework | Next.js + React + TypeScript | Free | Keep |
| UI Library | Chakra UI v3 | Free | **Replace** — see below |
| Database + Auth | Supabase (Free tier) | $0–25/mo | **Keep — best option** |
| Hosting | Vercel (Hobby/Pro) | $0–20/mo | Keep |
| Icons | Lucide React | Free | Keep |
| PWA | Workbox | Free | Keep |

### 2.2 Recommended Changes

#### Replace Chakra UI v3 with shadcn/ui + Tailwind CSS

**Why:**

1. **Chakra UI v3 is a full rewrite** from v2 with a new API (`createSystem`, `defineConfig`). The ecosystem is still stabilising and many community components/examples target v2.
2. **shadcn/ui** is not a library — it is copy-paste components built on Radix UI primitives + Tailwind CSS. You own the code, there are no version lock-in risks, and it is the most actively maintained component system in the React ecosystem.
3. **Tailwind CSS** gives you full control over the 4px radius rule and Inter typography with a single `tailwind.config.ts` file. No runtime CSS-in-JS overhead.
4. **Bundle size:** shadcn/ui + Tailwind produces smaller bundles than Chakra UI v3 since components are tree-shaken and styles are compiled at build time.
5. **Community:** shadcn/ui has the largest ecosystem of community components, templates, and examples. For a solo developer, this means faster development.

**Migration effort:** Medium. Component markup changes but business logic stays the same. The token system maps directly to Tailwind config.

#### Keep Supabase — It's the Best Choice

Supabase is the optimal backend for Fitbase:

- **Free tier** covers the entire MVP: 500MB database, 50K monthly active users, 1GB storage, 2M edge function invocations.
- **Auth** handles Google OAuth with zero custom code.
- **Row Level Security** handles multi-trainer data isolation at the database level — no application-level auth checks needed.
- **Realtime** subscriptions are included for live session tracking.
- **Cost at scale:** Pro tier ($25/month) handles 100K+ MAU and 8GB database. Fitbase will not exceed this for years.

#### Hosting: Vercel Free Tier

- Vercel's Hobby tier is free and supports Next.js PWAs with edge functions.
- For a single-trainer app, this is sufficient indefinitely.
- Pro tier ($20/month) is only needed if you hit 100GB bandwidth or need analytics.

### 2.3 Recommended Final Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| **Framework** | Next.js 14+ (App Router) + TypeScript | Free |
| **UI** | shadcn/ui + Tailwind CSS + Radix UI | Free |
| **Icons** | Lucide React | Free |
| **Database** | Supabase PostgreSQL | Free (up to $25/mo at scale) |
| **Auth** | Supabase Auth (Google OAuth) | Included |
| **Storage** | Supabase Storage | Included |
| **Realtime** | Supabase Realtime | Included |
| **Hosting** | Vercel | Free (up to $20/mo at scale) |
| **PWA** | next-pwa or Workbox | Free |
| **Monitoring** | Vercel Analytics (free tier) | Free |

**Total cost for MVP and first year: $0/month**
**Total cost at scale (50+ clients): $25–45/month**

### 2.4 Tailwind Config for Token System

If migrating to Tailwind, here is how the Fitbase token system maps:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      borderRadius: {
        'base': '0.25rem',   // 4px — buttons, inputs, badges
        'card': '0.75rem',   // 12px — cards, containers, modals
        'full': '9999px',    // circles
      },
      colors: {
        neutral: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        fab: {
          DEFAULT: '#9d174d',
          hover: '#831843',
          active: '#500724',
        },
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### 2.5 Alternative: Stay with Chakra UI v3

If you prefer to stay with Chakra UI v3 (to avoid migration effort), the current stack works. The key consideration is that Chakra v3's ecosystem is smaller and you may hit edge cases with fewer community solutions available. The token system defined in `Fitbase_Design_Tokens.md` maps directly to Chakra's `defineConfig`.

---

## Amendment 3: Typography Enforcement

This amendment formalises the Inter Medium / Inter Regular rule across all components.

### Rule

- **Inter Medium (500):** Headings (`h1`–`h6`), section subheadings, card titles, page titles, drawer titles, modal titles, accordion headers (client name).
- **Inter Regular (400):** Everything else — body text, form labels, input values, button labels, badge text, tag text, navigation labels, timestamps, metadata, table content, captions, placeholder text.

### No Semibold or Bold

The `fontWeight` tokens in the theme config only include `normal` (400) and `medium` (500). Values `600` (semibold) and `700` (bold) are intentionally excluded from the design system. Do not use them.

---

*End of Fitbase PRD Amendments*
