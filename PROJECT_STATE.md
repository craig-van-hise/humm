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
