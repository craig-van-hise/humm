### FILE: project_tree.txt


/Users/vv2024/Documents/Repos - vv2024/Humm
├── # Foundational Docs
|  ├── # Technical Specification Sheet- Humm (Mobile Web App).md
|  ├── ## Project- Humm — Mobile Web App.md
|  └── Therapeutic Humming Science Research.pdf
├── # PRPs
|  ├── # 0.md
|  ├── # 1.md
|  ├── # 2.md
|  ├── # 3.md
|  ├── # 4.md
|  ├── # 5.md
|  ├── # 6.md
|  └── # 7.md
├── PROJECT_STATE.md
├── README.md
├── index.html
├── llms.txt
├── package-lock.json
├── package.json
├── postcss.config.js
├── project_tree.txt
├── public
|  └── manifest.webmanifest
├── src
|  ├── App.tsx
|  ├── components
|  |  ├── AudioControls.tsx
|  |  ├── BreathRing.tsx
|  |  ├── PacingModeSelector.tsx
|  |  ├── PianoKeyboard.tsx
|  |  ├── PitchPicker.tsx
|  |  ├── SequenceSelector.tsx
|  |  └── TimingSettingsModal.tsx
|  ├── hooks
|  |  ├── useAudioEngine.ts
|  |  ├── usePersistentState.ts
|  |  ├── useSessionEngine.ts
|  |  └── useWakeLock.ts
|  ├── index.css
|  ├── main.tsx
|  ├── types
|  |  └── index.ts
|  └── utils
|     ├── audioContext.ts
|     └── pitchMath.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts

directory: 524 file: 4095

ignored: directory (40)


[2K[1G

### FILE: PROJECT_STATE.md

# Humm Project State

> **Last Updated:** July 27, 2026

## 1. System Architecture & Directory Tree

```
/Users/vv2024/Documents/Repos - vv2024/Humm
├── # Foundational Docs
│   ├── # Technical Specification Sheet- Humm (Mobile Web App).md
│   ├── ## Project- Humm — Mobile Web App.md
│   └── Therapeutic Humming Science Research.pdf
├── # PRPs
│   ├── # 0.md
│   ├── # 1.md
│   ├── # 2.md
│   ├── # 3.md
│   ├── # 4.md
│   ├── # 5.md
│   ├── # 6.md
│   └── # 7.md
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   └── manifest.webmanifest
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── AudioControls.tsx
│   │   ├── BreathRing.tsx
│   │   ├── PacingModeSelector.tsx
│   │   ├── PianoKeyboard.tsx
│   │   ├── PitchPicker.tsx
│   │   ├── SequenceSelector.tsx
│   │   └── TimingSettingsModal.tsx
│   ├── hooks
│   │   ├── useAudioEngine.ts
│   │   ├── usePersistentState.ts
│   │   ├── useSessionEngine.ts
│   │   └── useWakeLock.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types
│   │   └── index.ts
│   └── utils
│       ├── audioContext.ts
│       └── pitchMath.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 2. Active Tech Stack

- **Core & Build:** React 18.3, TypeScript 5.6, Vite 5.4
- **Audio Engine:** Tone.js (Web Audio API synthesis with synth drones, guide melodies, ADSR envelope management, and audio context safety)
- **UI & Styling:** Tailwind CSS 3.4, PostCSS, Lucide React icons, `clsx`, `tailwind-merge`
- **Animations:** Framer Motion 11.11 (60 FPS smooth visual ring scaling & transition indicators)
- **State & Storage:** Custom `usePersistentState` hook (LocalStorage persistence for root note, custom presets, pacing options, audio mixer levels)

---

## 3. Current System Capabilities

### Audio Engine Module (`useAudioEngine.ts`, `utils/pitchMath.ts`, `utils/audioContext.ts`)
- **Tone Synthesis:** Dual-layer drone oscillator (Root note + 5th with configurable octave offsets) paired with monophonic synth guide tones.
- **Pitch Math:** Mathematical conversion between scale degree notation (e.g. `1`, `7v`, `2^`), musical note names (`C3`, `G3`), and exact frequencies in Hz.
- **Mixer & Control:** Independent volume controls for Drone Root, Drone 5th, and Guide Pitch, along with instant stop cleanup.

### Session & Phase Engine (`useSessionEngine.ts`, `useWakeLock.ts`)
- **Lifecycle State Machine:** Orchestrates phase transitions (`ready` → `inhale` → `humming` → `resting` → `inhale`) with strict JavaScript timer lifecycle management.
- **Sequential Melody Guide:** Steps through scale degree sequences note-by-note during the humming phase and triggers guide audio.
- **Mobile Wake Lock:** Keeps mobile displays active during breathwork sessions via the Screen Wake Lock API.

### Visualizer & Interactive UI Components
- **`BreathRing.tsx`:** Animated SVG ring rendering 60 FPS breathing expansions/contractions and real-time active scale degree/note indicators.
- **`PianoKeyboard.tsx` & `PitchPicker.tsx`:** 17-key interactive touch keyboard centered on the chosen root note, allowing pitch selection and auditioning.
- **`SequenceSelector.tsx`:** Carousel for selecting and editing preset humming sequences (Vagal Calm, Focus/Theta, Sinus NO Recharge, custom user sequences).
- **`PacingModeSelector.tsx` & `TimingSettingsModal.tsx`:** Quick pacing mode selection and custom timing configuration modal (Inhale, Hum, Rest durations).
- **`AudioControls.tsx`:** Acoustic mixer modal for adjusting drone balance, octave shift, and guide pitch volume.

### State & Persistence (`usePersistentState.ts`)
- Preserves user preferences (root pitch, volume levels, custom timing parameters, custom sequences) across app reloads via LocalStorage.

### Current Work / Completed PRPs
- **PRP #0 - #6:** Initial scaffolding, audio math, piano keyboard, breath visualizer, mixer controls, custom pacing modes, and audio engine cleanup.
- **PRP #7 (Latest):** Implemented dedicated `useSessionEngine` hook to eliminate timer race conditions during phase transitions and ensure clean instant stopping.

---

## 4. Recent Evolution

Recent commits implemented custom timing modes, preset editing with negative interval support, drone octave shifting, state persistence via LocalStorage, and a dedicated `useSessionEngine` phase orchestrator to resolve timer hang bugs during session termination.


### FILE: README.md

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


