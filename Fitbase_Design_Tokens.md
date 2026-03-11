# Fitbase Design Token System

**Version:** 1.1
**Last Updated:** March 2026
**Platform:** React + Chakra UI v3

---

## 1. Design Philosophy

Fitbase uses a minimal, high-contrast design language built around sharp edges, neutral grays, and a single accent color reserved exclusively for the floating action button. Every interactive element uses a **4px border radius** as the default. Cards and containers use **12px**. Circles (avatars, FAB) use `full`. No other radius values are permitted.

---

## 2. Border Radius — The 4px Rule

The `4px` radius is the foundational corner radius of the Fitbase design system. It applies to every interactive and inline UI element. This is non-negotiable and must be enforced across all components.

### Token Map

| Token    | Value         | Pixel | Usage                                                        |
|----------|---------------|-------|--------------------------------------------------------------|
| `none`   | `0`           | 0px   | Dividers, flat separators                                    |
| `sm`     | `0.25rem`     | 4px   | Alias — identical to `base`                                  |
| `base`   | `0.25rem`     | 4px   | **PRIMARY** — Buttons, inputs, badges, tags, chips, toggles, dropdowns, text areas, selects, modals action buttons, drawer action buttons, bottom sheets, snackbars, tooltips |
| `md`     | `0.75rem`     | 12px  | Cards, containers, modals (outer shell), drawers (outer shell), bottom sheet (outer shell), date pickers (outer calendar panel) |
| `lg`     | `1rem`        | 16px  | Reserved — not used in current system                        |
| `xl`     | `1.5rem`      | 24px  | Reserved — not used in current system                        |
| `2xl`    | `2rem`        | 32px  | Reserved — not used in current system                        |
| `full`   | `9999px`      | ∞     | Circles only — avatars, FAB, circular indicators, set number circles |

### Strict Rules

1. **Every button** uses `borderRadius="base"` (4px) — primary, secondary, ghost, outline, destructive.
2. **Every input field** uses `borderRadius="base"` (4px) — text inputs, number inputs, selects, textareas, search bars.
3. **Every badge and tag** uses `borderRadius="base"` (4px) — training program tags, membership status badges, attendance status indicators.
4. **Cards and containers** use `borderRadius="md"` (12px) — client cards, session cards, stat cards, form containers, modal outer shells, drawer outer shells.
5. **Circles** use `borderRadius="full"` — avatars, set number indicators, FAB button, checkbox circles.
6. **No other radius value** is permitted. If a component does not fit these three categories, default to `base` (4px).

### Component-to-Radius Reference

| Component                     | Radius Token | Value  |
|-------------------------------|-------------|--------|
| Primary Button                | `base`      | 4px    |
| Secondary Button              | `base`      | 4px    |
| Ghost Button                  | `base`      | 4px    |
| Destructive Button (e.g. End Session) | `base` | 4px  |
| Text Input                    | `base`      | 4px    |
| Number Input (weight/reps)    | `base`      | 4px    |
| Select / Dropdown trigger     | `base`      | 4px    |
| Textarea                      | `base`      | 4px    |
| Search Bar                    | `base`      | 4px    |
| Badge (Active/Expiring/Expired) | `base`   | 4px    |
| Training Program Tag          | `base`      | 4px    |
| Chip / Filter Pill            | `base`      | 4px    |
| Toggle / Switch               | `full`      | pill   |
| Snackbar / Toast              | `base`      | 4px    |
| Tooltip                       | `base`      | 4px    |
| Client Card                   | `md`        | 12px   |
| Session Card                  | `md`        | 12px   |
| Stat Summary Card             | `md`        | 12px   |
| Form Container / Section      | `md`        | 12px   |
| Modal (outer shell)           | `md`        | 12px   |
| Drawer (outer shell)          | `md`        | 12px   |
| Bottom Sheet (outer shell)    | `md`        | 12px   |
| Accordion Container           | `md`        | 12px   |
| Avatar                        | `full`      | circle |
| Set Number Circle             | `full`      | circle |
| FAB Button                    | `full`      | circle |
| Completion Checkbox Circle    | `full`      | circle |

---

## 3. Color System

### 3.1 Neutral / Gray Scale (Core Palette)

| Token          | Hex       | Usage                                             |
|----------------|-----------|---------------------------------------------------|
| `neutral.50`   | `#fafafa` | Canvas background, subtle surface                 |
| `neutral.100`  | `#f5f5f5` | Page background, secondary button bg, tag bg      |
| `neutral.200`  | `#e5e5e5` | Borders, dividers, muted backgrounds              |
| `neutral.300`  | `#d4d4d4` | Emphasized borders, tag borders                   |
| `neutral.400`  | `#a3a3a3` | Placeholder text, subtle foreground               |
| `neutral.500`  | `#737373` | Secondary/muted text                              |
| `neutral.600`  | `#525252` | —                                                 |
| `neutral.700`  | `#404040` | —                                                 |
| `neutral.800`  | `#262626` | **Primary action color** — buttons, links, focus rings |
| `neutral.900`  | `#171717` | Hover state for primary buttons                   |
| `neutral.950`  | `#0a0a0a` | Primary text, headings, emphasized text            |

### 3.2 Accent — Pink/Burgundy (FAB Only)

| Token        | Hex       | Usage                    |
|--------------|-----------|--------------------------|
| `pink.800`   | `#9d174d` | FAB background           |
| `pink.900`   | `#831843` | FAB hover                |
| `pink.950`   | `#500724` | FAB active/pressed       |

**Rule:** Pink is used exclusively for the FAB center button in the bottom navigation. No other component uses pink.

### 3.3 Semantic Colors

| Semantic Set | Solid (bg)   | Foreground   | Muted (bg)   | Subtle (bg)  |
|-------------|-------------|-------------|-------------|-------------|
| **Success** | `#16a34a`   | `#15803d`   | `#dcfce7`   | `#f0fdf4`   |
| **Warning** | `#f59e0b`   | `#b45309`   | `#fef3c7`   | `#fffbeb`   |
| **Danger**  | `#dc2626`   | `#b91c1c`   | `#fee2e2`   | `#fef2f2`   |

### 3.4 Semantic Token Map

#### Backgrounds

| Token              | Resolves To        | Usage                            |
|--------------------|--------------------|----------------------------------|
| `bg.DEFAULT`       | `neutral.100`      | Page background (#f5f5f5)        |
| `bg.canvas`        | `neutral.50`       | Alternate page bg (#fafafa)      |
| `bg.surface`       | `white`            | Cards, inputs, modals            |
| `bg.subtle`        | `neutral.100`      | Secondary surfaces               |
| `bg.muted`         | `neutral.200`      | Hover states for ghost elements  |
| `bg.emphasized`    | `neutral.300`      | Active states                    |

#### Text / Foreground

| Token              | Resolves To        | Usage                            |
|--------------------|--------------------|----------------------------------|
| `fg.DEFAULT`       | `neutral.950`      | Primary text (#0a0a0a)           |
| `fg.muted`         | `neutral.500`      | Secondary text (#737373)         |
| `fg.subtle`        | `neutral.400`      | Placeholders, disabled text      |
| `fg.emphasized`    | `neutral.950`      | Headings, bold labels            |
| `fg.inverted`      | `white`            | Text on dark backgrounds         |

#### Borders

| Token              | Resolves To        | Usage                            |
|--------------------|--------------------|----------------------------------|
| `border.DEFAULT`   | `neutral.200`      | Standard borders (#e5e5e5)       |
| `border.muted`     | `neutral.100`      | Subtle separators                |
| `border.emphasized`| `neutral.300`      | Active/focus borders             |

---

## 4. Typography

### Font Family

**Inter** is the only typeface. No other font is used anywhere in the system.

```css
:root {
  --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### Weight Rules (Strict)

| Weight Token | Value | Name      | Usage                                              |
|-------------|-------|-----------|----------------------------------------------------|
| `medium`    | 500   | Medium    | **Headings and subheadings ONLY** — H1, H2, H3, H4, H5, H6, section titles, card titles |
| `normal`    | 400   | Regular   | **Everything else** — body text, labels, captions, badge text, button text, input text, placeholder text, navigation labels, table content |

### Strict Rules

1. **Inter Medium (500)** is used exclusively on heading elements (`<h1>` through `<h6>`) and section subheadings (e.g., "CURRENT EXERCISE", "UP NEXT").
2. **Inter Regular (400)** is used for all other text — body copy, form labels, input values, button labels, badge text, navigation labels, table cells, captions, timestamps, metadata.
3. **Semibold (600) and Bold (700) are NOT used** in the Fitbase design system. Do not apply them to any element.
4. Exception: Numeric counters inside the Attending Card badge may use `medium` (500) since they function as a subheading.

### Type Scale

Chakra UI v3 default `fontSizes` are used without overrides:

| Token  | Size   | Common Usage                              |
|--------|--------|-------------------------------------------|
| `xs`   | 0.75rem (12px) | Micro labels, timestamps, legal text |
| `sm`   | 0.875rem (14px) | Secondary text, badges, captions    |
| `md`   | 1rem (16px) | Body text, input values, button labels   |
| `lg`   | 1.125rem (18px) | Card titles, client names            |
| `xl`   | 1.25rem (20px) | Section headings                      |
| `2xl`  | 1.5rem (24px) | Page titles                            |
| `3xl`  | 1.875rem (30px) | Hero headings (Welcome Back)         |

### Global CSS

```css
body {
  font-family: var(--font-inter);
  font-weight: 400;
  color: #0a0a0a;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-inter);
  font-weight: 500;
}
```

### Usage Examples

```tsx
{/* Page Title — Inter Medium */}
<Heading fontSize="2xl" fontWeight="medium">Welcome Back</Heading>

{/* Section Label — Inter Medium */}
<Text fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
  Current Exercise
</Text>

{/* Body / Muted — Inter Regular */}
<Text fontSize="md" fontWeight="normal" color="fg.muted">
  Sign in to continue
</Text>

{/* Button Label — Inter Regular */}
<Button fontWeight="normal">Add Client</Button>

{/* Input Value — Inter Regular */}
<Input fontWeight="normal" />

{/* Badge — Inter Regular */}
<Badge fontWeight="normal">Strength</Badge>

{/* Client Name on Card — Inter Medium (it's a card title / subheading) */}
<Text fontSize="lg" fontWeight="medium">Ahmed Ali</Text>
```

---

## 5. Spacing

Chakra UI v3 default spacing scale is used without overrides. Key values referenced throughout Fitbase:

| Token | Value    | Usage                                  |
|-------|----------|----------------------------------------|
| `1`   | 0.25rem  | Tight gaps                             |
| `2`   | 0.5rem   | Badge padding, tight stacks            |
| `3`   | 0.75rem  | Inner card padding (compact)           |
| `4`   | 1rem     | Standard card padding, page margins    |
| `6`   | 1.5rem   | Section gaps                           |
| `8`   | 2rem     | Large section separation               |

---

## 6. Shadows

Chakra UI v3 default shadow tokens are used:

| Token | Usage                                     |
|-------|-------------------------------------------|
| `sm`  | Subtle card elevation                     |
| `md`  | Bottom navigation bar                     |
| `lg`  | FAB button, elevated modals               |

---

## 7. Component Token Reference

### 7.1 Buttons

| Variant     | Background          | Text              | Hover               | Active              | Radius  |
|------------|--------------------|--------------------|---------------------|---------------------|---------|
| Primary    | `neutral.800`      | `white`            | `neutral.900`       | `neutral.950`       | `base`  |
| Secondary  | `neutral.100`      | `neutral.950`      | `neutral.200`       | `neutral.300`       | `base`  |
| Ghost      | `transparent`      | `neutral.900`      | `neutral.100`       | `neutral.200`       | `base`  |
| Destructive| `danger.600`       | `white`            | `danger.700`        | `danger.800`        | `base`  |
| FAB        | `pink.800`         | `white`            | `pink.900`          | `pink.950`          | `full`  |

### 7.2 Inputs

| Property        | Token                  | Value           |
|----------------|------------------------|-----------------|
| Background     | `white`                | #ffffff         |
| Border         | `neutral.200`          | #e5e5e5         |
| Focus border   | `neutral.800`          | #262626         |
| Placeholder    | `neutral.400`          | #a3a3a3         |
| Radius         | `base`                 | 4px             |

### 7.3 Cards

| Property        | Token                  | Value           |
|----------------|------------------------|-----------------|
| Background     | `white`                | #ffffff         |
| Border         | `neutral.200`          | #e5e5e5         |
| Border width   | `1px`                  | —               |
| Radius         | `md`                   | 12px            |
| Padding        | `4` (1rem)             | 16px            |

### 7.4 Badges — Membership Status

| Status    | Background       | Text             | Radius  |
|-----------|-----------------|------------------|---------|
| Active    | `success.600`   | `white`          | `base`  |
| Expiring  | `warning.500`   | `neutral.900`    | `base`  |
| Expired   | `danger.600`    | `white`          | `base`  |

### 7.5 Tags — Training Programs

| Program       | Background       | Text             | Border           | Radius  |
|--------------|-----------------|------------------|------------------|---------|
| Strength     | `neutral.100`   | `neutral.900`    | `neutral.300`    | `base`  |
| Body-Trans   | `neutral.100`   | `neutral.900`    | `neutral.300`    | `base`  |
| Rehab        | `warning.50`    | `warning.900`    | `warning.200`    | `base`  |
| Athlete      | `success.50`    | `success.900`    | `success.200`    | `base`  |

### 7.6 Attendance Status Indicators

| Status       | Color / Token        | Indicator Style        |
|-------------|---------------------|------------------------|
| Scheduled   | `neutral.500`       | Muted text, no badge   |
| Attending   | `primary.solid`     | Dark card, active       |
| Attended    | `success.600`       | Green check icon        |
| Missed      | `danger.600`        | Red X icon              |
| Rescheduled | `warning.500`       | Orange refresh icon     |

### 7.7 Bottom Navigation

| State    | Icon Color       | Label Color      |
|---------|-----------------|------------------|
| Active  | `neutral.800`   | `neutral.800`    |
| Inactive| `neutral.400`   | `neutral.500`    |

### 7.8 Drawer / Bottom Sheet

| Property       | Token / Value        |
|---------------|---------------------|
| Overlay        | `rgba(0,0,0,0.4)`  |
| Background     | `white`             |
| Outer radius   | `md` (12px) — top corners only |
| Action buttons | `base` (4px)        |
| Handle bar     | `neutral.300`, 40px wide, `full` radius |

### 7.9 Accordion (Attending Page)

| Property            | Token / Value          |
|--------------------|------------------------|
| Container radius   | `md` (12px)            |
| Header background  | `white`                |
| Header border      | `neutral.200`          |
| Expanded content bg| `neutral.50`           |
| Inner input radius | `base` (4px)           |

---

## 8. Icon System

**Library:** Lucide React
**Default size:** `boxSize="5"` (20px) for inline, `boxSize="6"` (24px) for navigation
**Color:** Inherits from parent `color` token

---

## 9. Chakra UI v3 Theme Override

```typescript
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        neutral: {
          50:  { value: "#fafafa" },
          100: { value: "#f5f5f5" },
          200: { value: "#e5e5e5" },
          300: { value: "#d4d4d4" },
          400: { value: "#a3a3a3" },
          500: { value: "#737373" },
          600: { value: "#525252" },
          700: { value: "#404040" },
          800: { value: "#262626" },
          900: { value: "#171717" },
          950: { value: "#0a0a0a" },
        },
        pink: {
          800: { value: "#9d174d" },
          900: { value: "#831843" },
          950: { value: "#500724" },
        },
        success: {
          50:  { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          600: { value: "#16a34a" },
          700: { value: "#15803d" },
          900: { value: "#14532d" },
        },
        warning: {
          50:  { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          500: { value: "#f59e0b" },
          700: { value: "#b45309" },
          900: { value: "#78350f" },
        },
        danger: {
          50:  { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          600: { value: "#dc2626" },
          700: { value: "#b91c1c" },
        },
      },
      fonts: {
        heading: { value: "var(--font-inter)" },
        body:    { value: "var(--font-inter)" },
      },
      fontWeights: {
        normal: { value: "400" },
        medium: { value: "500" },
      },
      radii: {
        none: { value: "0" },
        sm:   { value: "0.25rem" },
        base: { value: "0.25rem" },
        md:   { value: "0.75rem" },
        lg:   { value: "1rem" },
        xl:   { value: "1.5rem" },
        "2xl": { value: "2rem" },
        full: { value: "9999px" },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg",
      color: "fg",
      fontFamily: "body",
      fontWeight: "400",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
      fontWeight: "500",
    },
    "*": {
      borderColor: "border",
    },
  },
})

export const system = createSystem(defaultConfig, config)
```

---

## 10. Audit Checklist

Use this checklist when reviewing any Fitbase screen or component:

- [ ] All buttons use `borderRadius="base"` (4px)
- [ ] All inputs use `borderRadius="base"` (4px)
- [ ] All badges/tags use `borderRadius="base"` (4px)
- [ ] All cards use `borderRadius="md"` (12px)
- [ ] All avatars use `borderRadius="full"`
- [ ] No `borderRadius` values outside of `base`, `md`, `full` are used
- [ ] Headings/subheadings use Inter Medium (500), nothing else
- [ ] All other text uses Inter Regular (400)
- [ ] No semibold (600) or bold (700) weights appear
- [ ] Pink is only used on the FAB button
- [ ] Primary buttons use `neutral.800` background
- [ ] Focus rings use `neutral.800`, not pink

---

*End of Fitbase Design Token System*
