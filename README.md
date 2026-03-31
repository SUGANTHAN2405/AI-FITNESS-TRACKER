# ⚡ IRONTRACK PRO — AI Fitness Tracker

<div align="center">

![IronTrack Pro](https://img.shields.io/badge/IronTrack-PRO-ff5a1f?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-39d98a?style=for-the-badge)

**A full-stack AI-powered fitness tracker built with React and Java Script.**  
Personalized workout plans, nutrition tracking, BMI/TDEE analysis, and real-time AI coaching — all in one dark-themed, mobile-first app.

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Auth** | Demo login system with two pre-built user profiles |
| 🧠 **AI Report** | Claude AI generates full fitness analysis: BMI, TDEE, goal alignment, action plan |
| 📋 **Onboarding** | 4-step profile wizard — body stats, level, macros, lifestyle |
| ⊞ **Dashboard** | Live stat cards — BMI, ideal weight, BMR, calorie status |
| 🏋️ **Workout Logger** | Log sets, reps, and weight per exercise with experience-adaptive plans |
| 🥗 **Nutrition Tracker** | Macro breakdown with pie chart visualization |
| 📊 **Analytics** | Weight trend chart, weekly training volume, personal records |
| 📱 **Mobile-First** | Fixed bottom nav, responsive layout, smooth page animations |

---

## 🧠 How the AI Works

IronTrack PRO uses the **Anthropic Claude API** to generate a personalized fitness report.

The AI calculates:
- **BMI** — standard formula with category classification
- **Ideal Weight Range** — Robinson (1983) + Devine (1974) formulas
- **BMR** — Mifflin-St Jeor equation
- **TDEE** — with activity-level multipliers
- **Calorie gap** — deficit, surplus, or on-target status
- **Goal alignment score** — 0–100 rating
- **Full action plan** — calories, protein, frequency, step goal, sleep
- **Doubt clearing** — 6 common fitness Qs answered for your profile

The AI adapts advice for:
- 🪑 Desk job workers (NEAT tips, 30–45 min workouts, step targets)
- 🌱 Beginners (form-first, consistency, full-body)
- 📈 Intermediate (progressive overload, split routines)
- 🏆 Advanced athletes (macro precision, deload, recovery)

---

## 🛠️ Tech Stack

- **Frontend** — React 18
- **Charts** — Recharts (LineChart, BarChart, PieChart)
- **AI** — Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Fonts** — Barlow Condensed, Barlow, Roboto Mono (Google Fonts)
- **Styling** — Inline styles with design token system

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API Key → [Get one here](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/irontrack-pro.git
cd irontrack-pro
npm install
cp .env.example .env
# Add your VITE_ANTHROPIC_API_KEY to .env
npm run dev
```

### Demo Accounts

| Email | Password | Profile |
|---|---|---|
| `alex@irontrack.io` | `alex123` | Male · 28 · Muscle Gain · Intermediate |
| `demo@fit.com` | `demo123` | Female · 25 · Fat Loss · Beginner |

> The AI tab requires a valid Anthropic API key.

---

## 📁 Project Structure

```
irontrack-pro/
├── src/
│   └── App.jsx              # Full application source
├── public/
│   └── index.html
├── docs/
│   ├── ABOUT.md             # Project background & motivation
│   ├── APP.md               # App architecture & component guide
│   └── CODE.md              # Code conventions & design decisions
├── .github/
│   └── CONTRIBUTING.md
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

> ⚠️ Never commit your `.env` file. Already in `.gitignore`.

---

## 🗺️ Roadmap

- [ ] Real authentication (Supabase / Firebase)
- [ ] Persistent workout history
- [ ] Exercise library (100+ movements)
- [ ] Progressive overload tracking
- [ ] Food search API integration
- [ ] PWA support

---

## 📄 License

MIT License. See `LICENSE` for details.

---

## 👤 Author

Built by **[SUGANTHAN M]** · [GitHub](https://github.com/SUGANTHAN2405)

<div align="center">Made with ⚡ React · Powered by Claude AI</div>
