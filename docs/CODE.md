# Code Guide

## File Organization

The entire app lives in `src/App.jsx`. Sections are separated by banner comments for navigation:

```
/* ─── TOKENS ──── */       Design constants (K object)
/* ─── DEMOS ───── */       Hardcoded demo user profiles
/* ─── FORMULAS ── */       Pure calculation functions (BMI, BMR, TDEE)
/* ─── PRIMITIVES  */       NumIn, TxtIn, Sel input components
/* ─── SHARED UI ─ */       Row, Grid, Card, Btn, Pill, Alert, StatBox
/* ─── AI SYSTEM ─ */       Claude system prompt constant
/* ═══ LOGIN ═════ */       Login page component
/* ═══ ONBOARDING  */       4-step wizard
/* ═══ DASHBOARD ═ */       Home page
/* ═══ AI REPORT ═ */       AI analysis page
/* ═══ WORKOUT ═══ */       Workout logger
/* ═══ NUTRITION ═ */       Nutrition tracker
/* ═══ ANALYTICS ═ */       Charts and stats
/* ═══ APP ROOT ══ */       Root component with routing
```

---

## Naming Conventions

| Pattern | Usage |
|---|---|
| `PascalCase` | React components (`NumIn`, `StatBox`, `AIReport`) |
| `camelCase` | State variables, handlers, local vars |
| `SCREAMING_SNAKE` | Constants (`K`, `DEMOS`, `AI_SYSTEM`, `AMULT`) |
| `K.xxx` | All color/spacing tokens |
| `anim-page`, `anim-step` | CSS animation class names (injected via `<style>`) |

---

## Input Handling Pattern

A key decision in this codebase: **all numeric inputs use `type="text"` with `inputMode="numeric"`**.

This prevents a common React bug where `type="number"` drops a leading digit when you type a single character (e.g., typing `8` shows nothing until you type a second digit).

```jsx
const NumIn = ({ value, onChange, ... }) => (
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ""))}
    ...
  />
);
```

State is always stored as a **raw string**. Conversion to number only happens at calculation time (`+profile.weight`, `parseInt(d.calories)`).

---

## Styling Pattern

No CSS files, no Tailwind, no CSS-in-JS library. Styles are plain inline objects using the `K` design token object.

```jsx
<div style={{
  background: K.s1,
  border: `1px solid ${K.b1}`,
  borderRadius: 8,
  padding: 20,
}}>
```

For reusable patterns, shared UI components (`Card`, `Row`, `Grid`, `StatBox`) accept a `style` prop for overrides.

---

## Animation System

Animations are defined in an injected `<style>` block at the top of the file (IIFE pattern):

```js
(() => {
  const s = document.createElement("style");
  s.textContent = `
    @keyframes fadeUp { ... }
    .anim-page { animation: fadeUp .5s ... }
  `;
  document.head.appendChild(s);
})();
```

Applied via `className` on page containers. This avoids needing any CSS file while keeping animations smooth.

---

## AI Prompt Engineering

The `AI_SYSTEM` constant is a carefully structured system prompt. Key techniques used:

1. **Role definition** — certified fitness analyst, nutrition planner, lifestyle strategist
2. **Explicit formulas** — exact math written out (BMR, TDEE, ideal weight)
3. **Conditional rules** — occupation-based (desk job protocol), experience-based, safety guards
4. **Strict JSON schema** — the entire response structure is defined in the prompt
5. **Anti-hallucination rules** — "Do NOT assume unknown values", "Do NOT overpromise"
6. **Output enforcement** — "RESPOND ONLY WITH THIS EXACT JSON (no markdown, no preamble)"

The user prompt is built dynamically from profile state:

```js
const prompt = `
  Age: ${p.age}, Gender: ${p.gender}, Height: ${p.height}cm, Weight: ${p.weight}kg
  Body Fat: ${p.bodyfat || "unknown"}%, Occupation: ${p.occupation}
  Activity Level: ${p.activityLevel}, Experience: ${p.experience}
  Goal: ${p.goal}, Workout Days/Week: ${p.workoutDays}
  ...
`;
```

---

## Calculation Utilities

Pure functions in the FORMULAS section:

```js
const calcBMI   = (w, h)     => +(w / ((h / 100) ** 2)).toFixed(1);
const calcBMR   = (w, h, a, g) => g === "male"
  ? 10*w + 6.25*h - 5*a + 5
  : 10*w + 6.25*h - 5*a - 161;
const calcTDEE  = (bmr, al)  => Math.round(bmr * (AMULT[al] || 1.2));
const calcIdeal = (h, g)     => { /* Robinson + Devine range */ };
```

These are used both in the Dashboard (client-side) and validated against the AI report output.

---

## Adding a New Page

1. Create a new component function (e.g., `const MyPage = ({ profile }) => { ... }`)
2. Add it to the `PAGES` object in `App`:
   ```js
   const PAGES = {
     ...
     mypage: <MyPage profile={profile} />,
   };
   ```
3. Add a nav entry to the `NAV` array:
   ```js
   { id: "mypage", ic: "🆕", lbl: "LABEL" }
   ```

---

## Known Limitations

- **No persistence** — all state resets on page refresh (no localStorage or backend)
- **Mock data** — Analytics charts use generated data, not real logged history
- **Demo auth only** — no real user accounts, registration, or password hashing
- **Single file** — works well for this scale, but would need splitting for larger features
