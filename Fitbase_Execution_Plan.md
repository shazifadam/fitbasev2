# Fitbase — Execution Plan (Claude Code Edition)

**Project:** Fitbase PWA v1.0
**Author:** Shazif Adam / Encrea Studio
**Date:** March 11, 2026
**Timeline:** 6 weeks (solo developer + Claude Code)
**Primary Dev Tool:** Claude Code (terminal-based agentic coding)

---

## Overview

This plan covers the full execution of Fitbase from the current implementation state to a production-ready MVP. It is structured around **Claude Code** as the primary development tool — every phase includes specific Claude Code prompting strategies, CLAUDE.md project context setup, and session workflows designed to maximise output while staying within plan limits.

The plan is broken into **6 MVPs**, each representing a shippable milestone that can be deployed, tested with real data, and validated before moving to the next. Each MVP has a clear definition of done and a rollout/test checklist.

---

## Claude Code Setup

### Recommended Plan

**Claude Pro ($20/month)** is sufficient for this project. Fitbase is a focused PWA with well-defined scope — most sessions will be Sonnet-based with occasional Opus for complex architectural decisions. If you find yourself hitting rate limits during heavy building days (Phases 1–2), consider upgrading to Max 5x ($100/month) for those weeks, then stepping back down.

| Plan | Monthly Cost | Best For |
|------|-------------|----------|
| **Pro** | $20/mo | Default — handles 80% of Fitbase work |
| **Max 5x** | $100/mo | Weeks 2–3 if doing heavy attendance flow build |

### CLAUDE.md Project Context

Create a `CLAUDE.md` file in the project root. Claude Code reads this automatically on every session, giving it persistent awareness of your project's architecture, conventions, and rules. This is critical for maintaining consistency across sessions.

```markdown
# CLAUDE.md — Fitbase Project Context

## Project
Fitbase is a PWA for personal trainers to manage clients, attendance, workouts, payments, and progress.

## Tech Stack
- Next.js 14+ (App Router) with TypeScript
- UI: [Chakra UI v3 OR shadcn/ui + Tailwind CSS] — see theme config
- Database + Auth: Supabase (PostgreSQL + Google OAuth)
- Icons: Lucide React
- Hosting: Vercel

## Architecture
- Server Actions pattern: all Supabase calls are async server actions in `src/actions/`
- Auth: `@supabase/ssr` for server-side auth
- Types: auto-generated in `src/types/supabase.ts` via `npx supabase gen types typescript`
- Pages: `src/app/` using Next.js App Router

## Design System — STRICT RULES
- **Border radius:** 4px (`base`) on ALL buttons, inputs, badges, tags. 12px (`md`) on cards, containers, modals. `full` on circles (avatars, FAB).
- **Typography:** Inter Medium (500) for headings and subheadings ONLY. Inter Regular (400) for EVERYTHING else. No semibold (600) or bold (700) anywhere.
- **Colors:** Primary action = neutral.800 (#262626). FAB only = pink.800 (#9d174d). No other pink usage.
- **Token reference:** See `docs/Fitbase_Design_Tokens.md` for full spec.

## File Structure
src/
  actions/       # Server actions (Supabase queries)
  app/           # Next.js App Router pages
  components/    # Reusable components
  lib/           # Supabase client, utilities
  types/         # Generated Supabase types
  styles/        # Theme config

## Commands
- `npm run dev` — start dev server
- `npx supabase db push` — push migrations
- `npx supabase gen types typescript --local > src/types/supabase.ts` — regen types
- `npm run build` — production build
- `npx supabase migration new <name>` — create new migration

## Current State
[Update this section as you complete each MVP]
```

### Session Workflow

Each coding session with Claude Code should follow this pattern:

1. **Start session** — Claude Code auto-reads `CLAUDE.md` for context.
2. **State the goal** — Be specific: "Build the SessionActionDrawer component that opens when tapping MoreVertical on a client card on the home dashboard."
3. **Reference docs** — Point to specific files: "Follow the spec in `docs/Fitbase_PRD_Amendments.md` section 1.3."
4. **Let Claude Code execute** — It will read files, write code, run tests, and iterate.
5. **Review and commit** — Check the output, then use `/commit` or commit manually.
6. **Use `/compact`** — At the end of long sessions, compact the context to save tokens for the next task.

### Useful Claude Code Commands

| Command | Purpose |
|---------|---------|
| `/init` | Initialize CLAUDE.md (first time only) |
| `/compact` | Compress conversation context — use between tasks |
| `/model sonnet` | Switch to Sonnet for routine work |
| `/model opus` | Switch to Opus for complex architecture |
| `/commit` | Stage and commit changes |
| `/cost` | Check current session cost |

### Token-Saving Tips

- Keep `CLAUDE.md` concise — under 500 lines. Link to external docs rather than inlining everything.
- Use `/compact` between tasks within the same session.
- For routine component building, stay on Sonnet. Switch to Opus only for complex multi-file refactors, database schema decisions, or debugging tricky state management.
- Break work into focused sessions (1–2 hours) rather than marathon 6-hour sessions. Shorter sessions = more targeted context = better output.
- Commit frequently so Claude Code can `git diff` to understand recent changes.

---

## MVP Milestones

### MVP 0: Foundation & Token System
### MVP 1: Session Flow (Drawer → Attending → Complete)
### MVP 2: Payments & Membership Status
### MVP 3: Progress Tracking
### MVP 4: Stats & Settings
### MVP 5: PWA, Export & Production Deploy

Each MVP is independently deployable and testable. Deploy to a Vercel preview branch after each MVP for live testing.

---

## MVP 0: Foundation & Token System

**Timeline:** Week 1 (3–4 Claude Code sessions)
**Branch:** `mvp/0-foundation`

### Goal

Apply the design token system, run DB migrations for the new attendance flow, and ensure the codebase is clean and consistent before building features.

### Claude Code Sessions

**Session 0.1 — Token Audit & Fix (Sonnet)**

Prompt:
> "Audit every component in `src/components/` and `src/app/` against the design token rules in `docs/Fitbase_Design_Tokens.md`. Fix all border radius values — every button, input, badge, and tag must use `base` (4px). Every card and container must use `md` (12px). List every file changed."

**Session 0.2 — Typography Cleanup (Sonnet)**

Prompt:
> "Search the entire codebase for any usage of `fontWeight: 'semibold'`, `fontWeight: 'bold'`, `fontWeight: '600'`, or `fontWeight: '700'`. Replace all of them. Headings and subheadings should use `fontWeight: 'medium'` (500). Everything else should use `fontWeight: 'normal'` (400). Do not use semibold or bold anywhere."

**Session 0.3 — Database Migration (Sonnet)**

Prompt:
> "Create a new Supabase migration that: (1) updates the attendance status constraint to include 'attending', (2) adds columns `session_started_at TIMESTAMPTZ`, `session_ended_at TIMESTAMPTZ`, `session_workout_id UUID REFERENCES workouts(id)`, and `exercise_weights JSONB DEFAULT '{}'` to the attendance table. Then regenerate the TypeScript types."

**Session 0.4 — Theme Config Update (Sonnet)**

Prompt:
> "Update the theme configuration in `src/styles/theme.ts` to match the exact token values in `docs/Fitbase_Design_Tokens.md`. Remove any fontWeight tokens other than normal (400) and medium (500). Ensure the radii tokens match exactly: base = 0.25rem, md = 0.75rem, full = 9999px."

### Definition of Done

- [ ] Every button in the app uses 4px radius
- [ ] Every input uses 4px radius
- [ ] Every badge/tag uses 4px radius
- [ ] Every card uses 12px radius
- [ ] No semibold or bold font weights exist in the codebase
- [ ] Headings use Inter Medium (500), body uses Inter Regular (400)
- [ ] Database migration applied — `attending` status and new columns exist
- [ ] TypeScript types regenerated and compiling clean
- [ ] `npm run build` passes with no errors

### Rollout & Test

1. Deploy to Vercel preview: `vercel --preview`
2. Walk through every existing screen on mobile (360px width)
3. Verify: all corners, typography weights, colors match the design tokens
4. Check Supabase dashboard: new columns visible on attendance table
5. Test existing flows still work: login, add client, view clients, mark attendance

---

## MVP 1: Session Flow — Drawer, Workout Selection, Attending Page

**Timeline:** Week 2–3 (6–8 Claude Code sessions)
**Branch:** `mvp/1-session-flow`
**Depends on:** MVP 0

### Goal

Implement the full revised attendance pipeline: client card more button → action drawer → optional workout selection → attending state → attending page with accordion exercise tracking → complete session.

### Claude Code Sessions

**Session 1.1 — Session Action Drawer (Sonnet)**

Prompt:
> "Create a `SessionActionDrawer` bottom sheet component at `src/components/attendance/SessionActionDrawer.tsx`. It opens when the user taps the MoreVertical icon on a client session card on the home dashboard. It shows the client name and training program tags at the top, followed by three full-width buttons stacked vertically: 'Start Session' (primary, neutral.800), 'Mark as Absent' (secondary), 'Reschedule' (secondary). All buttons use `borderRadius: base` (4px). The drawer outer shell uses `borderRadius: md` (12px) on top corners. Include a handle bar (40px wide, neutral.300, full radius). Follow the spec in `docs/Fitbase_PRD_Amendments.md` section 1.3."

**Session 1.2 — Mark Absent & Reschedule Actions (Sonnet)**

Prompt:
> "Wire the 'Mark as Absent' button in SessionActionDrawer to call a `markAbsent()` server action that updates the attendance record status to 'missed'. Wire the 'Reschedule' button to open a date/time picker, then create a rescheduled attendance record. Create both server actions in `src/actions/session.ts`. After each action, close the drawer and refresh the dashboard data."

**Session 1.3 — Workout Selection View (Sonnet)**

Prompt:
> "When 'Start Session' is tapped in SessionActionDrawer, transition the drawer content to a workout selection view. Fetch all workouts for the client from the workouts table. Show each workout as a card with the workout name and a comma-separated preview of exercise names (max 1 line, truncated with '+N more'). Include a 'Skip — Start without workout' ghost button at the bottom. Tapping a workout card or the skip button should call `startSession()` from `src/actions/session.ts`, which updates the attendance status to 'attending' and sets `session_started_at` and optionally `session_workout_id`. Handle the empty state when no workouts exist. Follow `docs/Fitbase_PRD_Amendments.md` section 1.4."

**Session 1.4 — Dashboard Amendments (Sonnet)**

Prompt:
> "Amend the home dashboard page. Rename the dark summary card at the top to 'Attending' and make its count reflect only clients with `status = 'attending'` for today. Tapping this card navigates to `/attending`. Below, split the client list into three sections: 'Scheduled' (status = 'scheduled'), 'Attended' (status = 'attended'), and 'Missed' (status = 'missed'). Hide sections with zero clients. Hide the Attending Card when the attending count is 0. Follow `docs/Fitbase_PRD_Amendments.md` section 1.6."

**Session 1.5 — Attending Page Scaffold (Sonnet → Opus if complex)**

Prompt:
> "Create the `/attending` page at `src/app/attending/page.tsx`. It has a header with back arrow and 'Attending' title plus a client count badge. Below, list all clients with `status = 'attending'` for today as accordion items. Each collapsed item shows: avatar, client name (Inter Medium), training program tags, elapsed duration timer (since `session_started_at`), and a chevron. Only one accordion can be expanded at a time. Use `borderRadius: md` (12px) on the accordion container."

**Session 1.6 — Expanded Accordion: Exercise Tracking (Opus recommended)**

Prompt:
> "Build the expanded accordion content for the attending page. When expanded, show the client's selected workout exercises. For each exercise: show name (Inter Medium, lg), set/rep info, and a table with columns Set (circle number), Previous (last session weight), Weight (kg) (number input, 4px radius), and Done (circle checkbox). The active weight input should have an orange highlight border. 'Previous' data comes from the same exercise in the client's most recent completed attendance record's `exercise_weights` JSONB. Include a 'UP NEXT' section below showing remaining exercises. Add a 'Complete Session' primary button at the bottom. Follow `docs/Fitbase_PRD_Amendments.md` section 1.5."

**Session 1.7 — Complete Session Logic (Sonnet)**

Prompt:
> "Wire the 'Complete Session' button on the attending page. It should collect all exercise weight data from the form state, call `completeSession()` server action which updates attendance status to 'attended', saves `exercise_weights` JSONB, and sets `session_ended_at`. If not all exercises are marked done, show a confirmation dialog: 'Not all exercises completed. Complete session anyway?' with Cancel and Complete buttons. After completing, collapse the accordion and show a completion indicator. The attending count should decrement."

**Session 1.8 — Integration Testing (Sonnet)**

Prompt:
> "Test the full session flow end-to-end. Start from the home dashboard, tap the more button on a client card, open the drawer, start a session with a workout, verify the client appears on the attending page, expand the accordion, enter weights, mark sets as done, complete the session, and verify the client moves to the Attended section on the home dashboard. Fix any bugs found."

### Definition of Done

- [ ] More button on client cards opens the action drawer
- [ ] Drawer shows Start Session, Mark as Absent, Reschedule
- [ ] Mark as Absent updates status to `missed` and moves card to Missed section
- [ ] Start Session opens workout selection (or skips if no workouts)
- [ ] Selecting a workout or skipping starts the session (`status = 'attending'`)
- [ ] Attending Card shows correct count and navigates to `/attending`
- [ ] Attending page shows all attending clients as accordion items
- [ ] Expanding an accordion shows exercise tracking with weight inputs
- [ ] Previous weights populate from last session
- [ ] Completing a session saves weights and moves client to Attended section
- [ ] Duration timer runs correctly
- [ ] All new components follow 4px/12px/full radius rules
- [ ] All typography follows Inter Medium (headings) / Regular (everything else)

### Rollout & Test

1. Deploy to Vercel preview
2. **Test with real data:** Add 3–4 test clients with scheduled sessions for today
3. Assign workouts to at least 2 clients
4. Walk through the full flow: drawer → start session → workout selection → attend → enter weights → complete
5. Test edge cases: client with no workouts (skip flow), mark as absent, reschedule
6. Test on mobile (iOS Safari + Android Chrome)
7. Verify the home dashboard sections update correctly in real time
8. Check Supabase: `exercise_weights` JSONB is populated correctly after completing a session

---

## MVP 2: Payments & Membership Status

**Timeline:** Week 3–4 (3–4 Claude Code sessions)
**Branch:** `mvp/2-payments`
**Depends on:** MVP 1

### Goal

Record monthly payments per client, calculate membership validity, and display Active/Expiring/Expired badges on client cards throughout the app.

### Claude Code Sessions

**Session 2.1 — Payment Server Actions (Sonnet)**

Prompt:
> "Create `src/actions/payments.ts` with: (1) `addPayment()` — inserts a payment record, calculates `valid_until` as payment_date + 30 days. (2) `getPaymentHistory()` — fetches all payments for a client ordered by date descending. (3) `getMembershipStatus()` — returns 'active', 'expiring' (≤3 days left), or 'expired' based on the latest payment's `valid_until`."

**Session 2.2 — Payment UI on Client Detail (Sonnet)**

Prompt:
> "Add a Payments section to `src/app/clients/[id]/page.tsx`. Include: (1) an 'Add Payment' button that opens a form with amount (auto-filled from tier), payment date (default today), and tier selector. (2) A payment history list below showing each payment with date, amount, and valid_until. (3) A membership status badge at the top of the client detail page (Active = green, Expiring = yellow, Expired = red). All badges use `borderRadius: base` (4px)."

**Session 2.3 — Membership Badges on Client Cards (Sonnet)**

Prompt:
> "Add membership status badges to every client card across the app — home dashboard cards, `/clients` list cards. The badge shows 'Active' (success.600 bg), 'Expiring' (warning.500 bg), or 'Expired' (danger.600 bg). Also add a membership status filter to the `/clients` page — tabs or filter pills for All / Active / Expiring / Expired."

**Session 2.4 — Edge Cases (Sonnet)**

Prompt:
> "Handle payment edge cases: (1) client with no payments shows 'No payment recorded' with a prompt to add one. (2) Expiring badge shows 'Expires in N days' tooltip. (3) Expired clients still appear on the dashboard if they have a scheduled session today."

### Definition of Done

- [ ] Payments can be added from client detail page
- [ ] Payment amount auto-fills from tier
- [ ] `valid_until` calculated correctly (payment_date + 30 days)
- [ ] Payment history displays on client detail page
- [ ] Membership badge (Active/Expiring/Expired) shows on client detail page
- [ ] Membership badge shows on all client cards (home, clients list)
- [ ] Membership filter works on `/clients` page
- [ ] No payment state handled gracefully
- [ ] All badges use 4px radius

### Rollout & Test

1. Deploy to Vercel preview
2. Add payments for test clients with varying dates (active, expiring in 2 days, expired)
3. Verify badges display correctly on client detail, home dashboard, and clients list
4. Verify filter works on clients page
5. Test adding a new payment and confirm badge updates immediately
6. Check Supabase: `valid_until` dates are correct

---

## MVP 3: Progress Tracking

**Timeline:** Week 4 (2–3 Claude Code sessions)
**Branch:** `mvp/3-progress`
**Depends on:** MVP 2

### Goal

Log body metrics (weight, waist, fat%, height) per client, show progress history with delta arrows, and optionally add a sparkline chart.

### Claude Code Sessions

**Session 3.1 — Progress Server Actions & Form (Sonnet)**

Prompt:
> "Create `src/actions/progress.ts` with `addProgress()` and `getProgressHistory()`. Add a Progress section to `src/app/clients/[id]/page.tsx` with: (1) an 'Add Progress' button opening a form for weight (kg), waist (cm), fat (%), height (cm). (2) On submit, insert into progress table and update `clients.current_*` fields. (3) Below the form, show a progress history list with each entry showing the date and values, plus delta arrows (▲ green or ▼ red) comparing to the previous entry."

**Session 3.2 — Sparkline Chart (Sonnet)**

Prompt:
> "Add a simple weight-over-time sparkline chart to the Progress section on the client detail page using Recharts. Show the last 10 data points. Minimal styling — thin line, no axes labels, just the trend line with dots on each data point. Keep the chart compact (200px height max)."

### Definition of Done

- [ ] Progress form works for weight, waist, fat%, height
- [ ] Progress history list shows on client detail page
- [ ] Delta arrows show ▲ (green) for improvement, ▼ (red) for regression
- [ ] Current client metrics update after each entry
- [ ] Sparkline chart shows weight trend
- [ ] All inputs use 4px radius

### Rollout & Test

1. Deploy to Vercel preview
2. Add 5+ progress entries for a test client across different dates
3. Verify delta arrows calculate correctly
4. Verify sparkline chart renders correctly
5. Verify `clients.current_*` fields update in Supabase

---

## MVP 4: Stats Page & Settings

**Timeline:** Week 4–5 (3–4 Claude Code sessions)
**Branch:** `mvp/4-stats-settings`
**Depends on:** MVP 2 (needs payment data), MVP 1 (needs attendance data)

### Goal

Build the monthly stats/analytics page and complete the Settings/More page with tier management.

### Claude Code Sessions

**Session 4.1 — Stats Page (Sonnet)**

Prompt:
> "Create `src/app/stats/page.tsx`. Deploy the `get_monthly_stats()` database function from the PRD. Build a stats page with: (1) month selector (back/forward arrows), (2) monthly income card (sum of payments), (3) attendance rate card (attended / total scheduled), (4) new clients vs lost clients card, (5) active/expiring/expired client count. Use card components with `borderRadius: md` (12px). All headings Inter Medium, body Inter Regular."

**Session 4.2 — Settings/More Page (Sonnet)**

Prompt:
> "Build `src/app/more/page.tsx` with: (1) trainer profile display (name, email, photo from Supabase Auth), (2) tier management — list all tiers with edit/delete, create new tier form (name, color, amount, max clients), (3) logout button, (4) app version display. All buttons 4px radius, cards 12px radius."

**Session 4.3 — Tier CRUD (Sonnet)**

Prompt:
> "Create `src/actions/tiers.ts` with full CRUD: `createTier()`, `updateTier()`, `deleteTier()`, `getTiers()`. Wire them into the tier management UI on the More page. Prevent deletion of a tier that has active clients assigned to it — show an error message instead."

### Definition of Done

- [ ] Stats page shows monthly income, attendance rate, new/lost clients
- [ ] Month selector navigates between months
- [ ] More page shows trainer profile
- [ ] Tier management: list, create, edit, delete
- [ ] Tier deletion blocked if clients are assigned
- [ ] Logout works
- [ ] Bottom navigation links to stats and more pages work

### Rollout & Test

1. Deploy to Vercel preview
2. Verify stats calculate correctly against known test data
3. Navigate between months and verify data changes
4. Create, edit, delete tiers on the More page
5. Try deleting a tier with assigned clients — verify error message
6. Test logout flow

---

## MVP 5: PWA, Export & Production Deploy

**Timeline:** Week 5–6 (4–5 Claude Code sessions)
**Branch:** `mvp/5-production`
**Depends on:** All previous MVPs

### Goal

Make Fitbase installable as a PWA, add CSV export, run a full quality pass, and deploy to production.

### Claude Code Sessions

**Session 5.1 — PWA Setup (Sonnet)**

Prompt:
> "Set up PWA for the Next.js app. Create `public/manifest.json` with Fitbase branding (name, short_name, theme_color #9d174d, background_color #f5f5f5). Generate icon placeholders (192px, 512px, maskable). Configure `next-pwa` or a Workbox service worker with: network-first for Supabase API, cache-first for static assets, stale-while-revalidate for scripts/styles. Add the install prompt handler."

**Session 5.2 — CSV Export (Sonnet)**

Prompt:
> "Add a CSV export feature. Create a server action `exportAttendanceCSV()` that generates attendance data as CSV for a given client or a given month. Add export buttons on: (1) client detail page → export this client's attendance, (2) stats page → export this month's attendance for all clients. The CSV should include: date, client name, status, workout name, duration."

**Session 5.3 — Full Token Audit (Sonnet)**

Prompt:
> "Do a final comprehensive audit of every file in `src/`. Check every component against the `Fitbase_Design_Tokens.md` rules. Specifically verify: (1) all border radius values are correct (base/md/full only), (2) no fontWeight semibold or bold exists, (3) primary buttons use neutral.800, (4) pink is only used on FAB, (5) all inputs have neutral.800 focus borders. List every violation found and fix them."

**Session 5.4 — Responsive & Mobile Testing (Sonnet)**

Prompt:
> "Review all pages for mobile responsiveness at 360px, 390px, and 428px viewport widths. Fix any layout issues, overflows, or touch target problems. Ensure the bottom navigation bar doesn't overlap content. Ensure all drawers and modals work correctly on mobile."

**Session 5.5 — Production Deploy (Sonnet)**

Prompt:
> "Prepare for production deployment. Run `npm run build` and fix any errors or warnings. Check that all environment variables are properly referenced. Create a `.env.example` file documenting all required variables. Verify the Vercel configuration. Run a Lighthouse audit and target 90+ on Performance, Accessibility, Best Practices, and PWA."

### Definition of Done

- [ ] App is installable as PWA on Android and iOS
- [ ] Service worker caches assets and handles offline gracefully
- [ ] CSV export works for per-client and per-month attendance
- [ ] All screens pass the design token audit (4px, Inter Medium/Regular, color tokens)
- [ ] All screens work on 360px–428px mobile widths
- [ ] Lighthouse scores: Performance 90+, Accessibility 90+, Best Practices 90+, PWA 90+
- [ ] Production build passes with no errors
- [ ] Environment variables documented
- [ ] Deployed to production on Vercel with custom domain (if applicable)

### Rollout & Test

1. Deploy to production
2. Install as PWA on a real Android device and iOS device
3. Walk through the complete user journey: login → add client → schedule → start session → track workout → complete → add payment → log progress → view stats → export CSV
4. Test offline: toggle airplane mode, verify cached data displays, verify sync when back online
5. Share with 1–2 beta testers (real trainers if possible) for feedback

---

## Timeline Summary

| MVP | Week(s) | Sessions | Focus | Ship Gate |
|-----|---------|----------|-------|-----------|
| **MVP 0** — Foundation | 1 | 4 | Token audit, DB migration, theme cleanup | All existing flows still work with new tokens |
| **MVP 1** — Session Flow | 2–3 | 8 | Drawer, workout select, attending page, complete | Full session pipeline works end-to-end |
| **MVP 2** — Payments | 3–4 | 4 | Payment recording, membership badges | Payments record and badges display correctly |
| **MVP 3** — Progress | 4 | 3 | Body metrics, deltas, sparkline | Progress entries save and deltas calculate |
| **MVP 4** — Stats & Settings | 4–5 | 4 | Analytics page, tier management | Stats render correctly, tiers are manageable |
| **MVP 5** — Production | 5–6 | 5 | PWA, export, audit, deploy | Installable, exportable, Lighthouse 90+ |
| **Total** | **6 weeks** | **~28 sessions** | | |

---

## Cost Breakdown

### Development Tools

| Tool | Cost | Notes |
|------|------|-------|
| Claude Code (Pro plan) | $20/mo | Sufficient for most phases |
| Claude Code (Max 5x) | $100/mo | Optional upgrade for Weeks 2–3 heavy building |
| Git + GitHub | Free | Private repos |
| Vercel CLI | Free | Deploy tooling |
| Supabase CLI | Free | DB management |
| Chrome DevTools | Free | PWA/mobile testing |

**Estimated Claude Code cost for full project: $40–140** (2 months of Pro, or 1 month Pro + 1 month Max)

### Runtime Costs

| Service | MVP (Free Tier) | Scale ($25–45/mo) |
|---------|----------------|-------------------|
| Supabase | Free: 500MB DB, 50K MAU | Pro: $25/mo |
| Vercel | Free: 100GB bandwidth | Pro: $20/mo |
| Google Fonts (Inter) | Free | Free |
| Domain (optional) | — | ~$12/year |
| **Total** | **$0/month** | **$25–45/month** |

---

## Claude Code Session Budget

Based on Pro plan limits (~45 messages per 5-hour window on Sonnet), here's how to distribute sessions across each MVP:

| MVP | Sessions | Estimated Messages | Model |
|-----|----------|--------------------|-------|
| 0 — Foundation | 4 | ~120 | Sonnet |
| 1 — Session Flow | 8 | ~300 | Sonnet (6) + Opus (2) |
| 2 — Payments | 4 | ~120 | Sonnet |
| 3 — Progress | 3 | ~80 | Sonnet |
| 4 — Stats & Settings | 4 | ~120 | Sonnet |
| 5 — Production | 5 | ~150 | Sonnet |
| **Total** | **28** | **~890** | |

At ~45 messages per 5-hour window on Pro, this is roughly 20 five-hour windows of coding spread across 6 weeks — very manageable on the Pro plan.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Claude Code rate limits during heavy weeks | Upgrade to Max 5x for Weeks 2–3, or spread sessions across more days |
| Context window exceeded on complex components | Use `/compact` between tasks; break accordion exercise tracker into sub-components |
| Supabase free tier limits | Monitor in dashboard; Pro upgrade is instant at $25/mo |
| Offline sync complexity | Keep offline support simple — cache-first for reads, defer writes until online |
| Scope creep | Stick to the 5 MVP milestones. Anything not in these MVPs goes to V2. |
| Claude Code producing inconsistent design | CLAUDE.md enforces token rules; run token audit session (5.3) as final gate |

---

## File Deliverables

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context file — Claude Code reads this automatically |
| `docs/Fitbase_Design_Tokens.md` | Design token system reference |
| `docs/Fitbase_PRD_Amendments.md` | Amended attendance flow and tech stack |
| `docs/Fitbase_Execution_Plan.md` | This document |

---

*End of Fitbase Execution Plan — Claude Code Edition*
