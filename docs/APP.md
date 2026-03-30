# App Architecture

## Overview

IronTrack PRO is a single-file React application. All components, logic, and styles live in `src/App.jsx`. This is intentional — it keeps the project portable, zero-config, and easy to deploy as a Claude artifact or embed in any React environment.

---

## Component Tree

```
App (root)
├── Login
├── Onboarding
│   ├── Step 0: Body Stats (age, gender, height, weight, body fat, medical, occupation)
│   ├── Step 1: Level & Goal (experience, primary goal, workout days/week)
│   ├── Step 2: Macros (calories, protein, carbs, fats)
│   └── Step 3: Lifestyle (sleep, training type)
└── Main App Shell
    ├── Header (logo, user info, logout)
    ├── Bottom Nav (Home, AI, Train, Eat, Stats, Next)
    └── Pages
        ├── Dashboard
        ├── AIReport
        ├── WorkoutLogger
        ├── Nutrition
        └── Analytics
```

---

## Pages

### 🔐 Login
- Email + password form
- Validates against `DEMOS` object (two hardcoded demo users)
- Routes to Onboarding (new user) or App (returning user with profile)

### 📋 Onboarding
- 4-step wizard with animated step indicator and progress bar
- Each step collects a different profile layer
- Validates required fields before advancing
- Contextual alerts (desk job detected, calorie range warning, macro mismatch)
- On complete → sets profile in state → navigates to AI page

### ⊞ Dashboard
- Reads profile from state, computes BMI, BMR, ideal weight, TDEE
- 4 stat cards: BMI (with category color), Ideal Weight Range, BMR, Calorie Status
- Calorie comparison: intake vs TDEE with deficit/surplus pill
- Macro breakdown: protein / carbs / fats with color-coded progress bars
- Quick-access cards to AI, Workout, Nutrition pages

### 🧠 AIReport
- Calls Anthropic Claude API on mount (or on manual trigger)
- Sends full profile as a structured user prompt
- Uses `AI_SYSTEM` constant as the system prompt (enforces JSON schema)
- Parses response → renders structured sections:
  - Score badge + calorie status
  - Stat grid (BMI, ideal weight, BMR, TDEE)
  - Goal summary + what's working / misaligned
  - Expert remark
  - 4 personalized remarks
  - Action plan (7 fields)
  - Timeline
  - Lifestyle risk flags
  - 6 doubt-clearing Q&As

### 🏋️ WorkoutLogger
- Shows a suggested workout plan based on `experience` level:
  - `beginner` / `none` → Full Body A/B
  - `intermediate` → Push/Pull/Legs
  - `advanced` → Chest/Triceps, Back/Biceps, Legs/Shoulders
- User can log sets/reps/weight per exercise
- Tracks "logged" state per exercise with check animation

### 🥗 Nutrition
- Reads profile macros (calories, protein, carbs, fats)
- PieChart showing macro ratio
- Meal timing guide (pre/intra/post workout)
- Food suggestions per macro category

### 📊 Analytics
- Weight trend line chart (6-week mock data relative to profile weight)
- Weekly training volume bar chart
- Personal records table (mock data: Bench, Squat, Deadlift)

---

## State Management

All state is managed with `useState` at the `App` root level. No external state library.

| State | Type | Description |
|---|---|---|
| `screen` | string | `"login"` / `"onboard"` / `"app"` |
| `user` | object | `{ name, av, email }` |
| `profile` | object | Full fitness profile from onboarding |
| `page` | string | Active page ID |

Profile data flows down as props to all page components. No context or global store needed at current scale.

---

## Design Token System

All colors and values are stored in the `K` constant:

```js
const K = {
  bg: "#0a0a0a",     // page background
  s1: "#111111",     // surface 1 (header, cards)
  ora: "#ff5a1f",    // primary accent
  grn: "#39d98a",    // success / positive
  red: "#ff4560",    // error / warning
  yel: "#f5c842",    // caution / PRs
  blu: "#4da6ff",    // info / secondary
  txt: "#f0ede8",    // primary text
  dim: "#8a8680",    // secondary text
  mut: "#484440",    // muted / labels
}
```

All components consume `K` directly — no CSS variables, no Tailwind, no stylesheet imports.

---

## AI Integration

The AI call happens in `AIReport` using a `fetch` to `https://api.anthropic.com/v1/messages`.

Key design decisions:
- **System prompt** (`AI_SYSTEM`) enforces exact JSON schema — no markdown, no preamble
- **User prompt** is a structured string built from profile fields
- **Error handling** — shows error card if API fails or JSON is malformed
- **Loading state** — animated spinner with scanline effect during API call
- The model used is `claude-sonnet-4-20250514`

---

## Input Primitives

Three reusable input components handle the entire form system:

- `NumIn` — numeric input (`type="text"` + `inputMode="numeric"` to prevent single-digit bugs)
- `TxtIn` — text / email / password input
- `Sel` — custom styled select with SVG chevron

All three track focus state locally and apply the orange focus ring via `useInput` hook.
