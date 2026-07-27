# Humm — Mobile Web App

> **Therapeutic Humming & Vagal Breathwork Guide**

**Humm** is a minimalist, mobile-first web application designed to pair the physiological and neurological benefits of therapeutic humming (vagal nerve stimulation, sinus nitric oxide release, parasympathetic activation) with gentle, reference-guided pitch sequences.

---

## 🌟 Key Features

* **Visual Breath Pacer:** 60 FPS animated breath ring (`BreathRing`) pacing through Inhale, Humming, and Resting cycles with phase duration timers.
* **Peak Sinus Nitric Oxide (NO) Target:** Highlights $130\text{ Hz} - 150\text{ Hz}$ ($C_3 - D_3$) as the optimal frequency window for paranasal sinus ventilation and NO boost.
* **Dual Audio Engine:** Warm, lowpass-filtered background drone (Root + 5th with octave shift controls) paired with monophonic guide tone melodies using Tone.js.
* **Session Lifecycle Engine:** Dedicated timer orchestrator managing phase transitions, step-by-step note timing, and instant audio termination.
* **17-Key Touch Keyboard:** Interactive piano keyboard centered around root pitch with real-time active note glowing highlights.
* **Custom Pacing & Preset Sequences:** Flexible pacing controls (Inhale, Hum, Rest durations) and customizable melody sequences saved locally via `usePersistentState`.
* **Screen Wake Lock:** Prevents mobile display dimming during active sessions.

---

## 🚀 Tech Stack

* **Framework:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS v3 (Dark mode theme, mobile safe-area insets)
* **Audio:** Tone.js (Web Audio API wrapper with ADSR envelope smoothing)
* **Animations:** Framer Motion 11
* **Icons & Utilities:** Lucide React, `clsx`, `tailwind-merge`

---

## 📂 Project Structure

```
.
├── # Foundational Docs/   # Architecture and scientific specification sheets
├── # PRPs/                # Product Requirement Packages (#0 through #7)
├── public/                # Web app manifest and static assets
├── src/
│   ├── components/        # AudioControls, BreathRing, PacingModeSelector, PianoKeyboard, PitchPicker, SequenceSelector, TimingSettingsModal
│   ├── hooks/             # useAudioEngine, usePersistentState, useSessionEngine, useWakeLock
│   ├── types/             # Type definitions
│   ├── utils/             # audioContext, pitchMath
│   ├── App.tsx            # Main application layout and state integration
│   └── main.tsx           # React DOM root entry
├── PROJECT_STATE.md       # Detailed system state & capability map
└── llms.txt               # LLM documentation index
```

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# App will run at: http://localhost:5173

# 3. Build for production
npm run build
```

---

## 📄 License

MIT License &copy; 2026 Humm
