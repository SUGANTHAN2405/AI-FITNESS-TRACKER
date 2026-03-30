# About IronTrack PRO

## 🎯 Motivation

Most fitness apps either drown you in data or give you vague generic advice. IronTrack PRO was built with one goal: **give every user the clarity of having a personal trainer and nutritionist in their pocket** — powered by real AI, not pre-written templates.

The idea came from a simple observation: people know they need to eat better and train smarter, but they don't know *exactly* what that means for their specific body, lifestyle, and goal. A 28-year-old desk worker trying to build muscle has completely different needs from a 25-year-old active person trying to lose fat. Generic apps ignore this. IronTrack doesn't.

---

## 🧩 Problem Statement

- Generic fitness apps give the same plan to everyone
- Most people don't know their TDEE, BMR, or ideal weight range
- Calorie and macro targets are usually guessed, not calculated
- Desk workers have unique challenges (sitting risk, NEAT, limited time) that apps don't address
- AI fitness tools exist, but most are chatbots — not structured analysis engines

---

## 💡 Solution

IronTrack PRO collects a detailed user profile through a 4-step onboarding wizard, then feeds it to Claude AI with a precision-engineered prompt that enforces:

- Evidence-based formulas (Mifflin-St Jeor BMR, Devine/Robinson ideal weight)
- Goal-specific calorie targets (deficit for fat loss, surplus for muscle gain)
- Occupation-aware advice (desk job protocol vs. active lifestyle)
- Experience-level personalization (beginner → advanced)
- Safety guardrails (no medical advice, no extreme calorie flags, doctor referral for BMI >35)

The result is a structured JSON report that powers a rich UI — not just a wall of text.

---

## 🎨 Design Philosophy

**Dark, focused, athletic.** The design system uses:

- `#0a0a0a` near-black background for zero eye strain in gym lighting
- `#ff5a1f` orange accent — energetic, motivating, high contrast
- Barlow Condensed for display type — bold, sporty, compact
- Roboto Mono for data — readable, technical, trustworthy
- Micro-animations: fade-up on page load, slide-in on steps, count-up on stats

The UI is deliberately minimal — no sidebars, no modals, no clutter. Just the data you need, when you need it.

---

## 🏗️ What I Learned

- Prompt engineering for structured JSON output with strict schema enforcement
- Designing multi-step onboarding flows with validation and contextual alerts
- Building a design token system in React without any CSS framework
- Handling numeric input edge cases (single-digit bug with `type="number"`)
- Recharts integration for responsive data visualization in dark themes

---

## 📅 Timeline

Built as a personal project to explore AI-powered UX patterns and fitness tech. The core app was designed, built, and polished in a focused sprint.

---

## 🔮 Future Vision

IronTrack PRO is designed to grow into:

1. **Full auth + cloud sync** — Supabase for real user accounts and history
2. **Workout progression** — Track volume over time, auto-suggest weight increases
3. **Food diary** — Search real foods, log meals, hit macro targets
4. **Weekly AI check-in** — Re-run the AI report each week to track progress
5. **Mobile app** — React Native port with push reminders
