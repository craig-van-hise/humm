# Humm Project State

> **Last Updated:** July 29, 2026

## 1. System Architecture & Directory Tree

```
/Users/vv2024/Documents/Repos - vv2024/Humm
├── # Foundational Docs
│   ├── # Technical Specification Sheet- Humm (Mobile Web App).md
│   ├── ## Project- Humm — Mobile Web App.md
│   └── Therapeutic Humming Science Research.pdf
├── # PRPs
│   ├── # 11.md
│   ├── # 12.md
│   ├── # 13.md
│   └── xOlder
│       ├── # 0.md
│       ├── # 1.md
│       ├── # 10.md
│       ├── # 2.md
│       ├── # 3.md
│       ├── # 4.md
│       ├── # 5.md
│       ├── # 6.md
│       ├── # 7.md
│       ├── # 8.md
│       └── # 9.md
├── PROJECT_CONTEXT_BUNDLE.md
├── PROJECT_STATE.md
├── README.md
├── index.html
├── llms.txt
├── package-lock.json
├── package.json
├── postcss.config.js
├── project_tree.txt
├── public
│   ├── 342968__iternetcone__tanpura-c.wav
│   ├── 416766__xavip2p__tampura-13610hz.mp3
│   └── manifest.webmanifest
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── AudioControls.tsx
│   │   ├── BreathRing.tsx
│   │   ├── PacingModeSelector.tsx
│   │   ├── PianoKeyboard.tsx
│   │   ├── SequenceSelector.tsx
│   │   ├── TimingSettingsModal.tsx
│   │   ├── ToneSettingsModal.tsx
│   │   └── __tests__
│   ├── hooks
│   │   ├── __tests__
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
- **Audio Engine:** Tone.js (Web Audio API synthesis with synth drones, Tampura drone sample playback, Free Mode / unguided drones, guide melodies, ADSR envelope management, and tonal shaping controls)
- **UI & Styling:** Tailwind CSS 3.4, PostCSS, Lucide React icons, `clsx`, `tailwind-merge`
- **Animations:** Framer Motion 11.11 (60 FPS smooth visual ring scaling & transition indicators)
- **State & Storage:** Custom `usePersistentState` hook (LocalStorage persistence for root note, custom presets, pacing options, audio mixer levels, synth tone shaping)

---

## 3. Current System Capabilities

### Audio Engine Module (`useAudioEngine.ts`, `utils/pitchMath.ts`, `utils/audioContext.ts`)
- **Tone & Drone Synthesis:** Dual-layer drone oscillator (Root note + 5th with configurable octave offsets), Tampura drone audio sample playback, and customizable synth tone shaping (Filter cutoff, resonance, synth waveforms).
- **Free Mode Support:** Unguided drone playback allowing continuous background drone listening without active breath session timers.
- **Pitch Math:** Mathematical conversion between scale degree notation (e.g. `1`, `7v`, `2^`), musical note names (`C3`, `G3`), and exact frequencies in Hz.
- **Mixer & Control:** Independent volume controls for Drone Root, Drone 5th, Tampura, and Guide Pitch, along with instant stop cleanup.

### Session & Phase Engine (`useSessionEngine.ts`, `useWakeLock.ts`)
- **Lifecycle State Machine:** Orchestrates phase transitions (`ready` → `inhale` → `humming` → `resting` → `inhale`) with strict JavaScript timer lifecycle management and fix for breathe hang states.
- **Sequential Melody Guide:** Steps through scale degree sequences note-by-note during the humming phase and triggers guide audio.
- **Mobile Wake Lock:** Keeps mobile displays active during breathwork sessions via the Screen Wake Lock API.

### Visualizer & Interactive UI Components
- **`BreathRing.tsx`:** Animated SVG ring rendering 60 FPS breathing expansions/contractions and real-time active scale degree/note indicators.
- **`PianoKeyboard.tsx`:** 17-key interactive touch keyboard centered on the chosen root note, featuring low-latency keyboard selection.
- **`SequenceSelector.tsx`:** Carousel for selecting and editing preset humming sequences (Vagal Calm, Focus/Theta, Sinus NO Recharge, custom user sequences).
- **`PacingModeSelector.tsx` & `TimingSettingsModal.tsx`:** Quick pacing mode selection and custom timing configuration modal (Inhale, Hum, Rest durations).
- **`ToneSettingsModal.tsx`:** Custom modal interface for tweaking synth brightness, resonance, and timbre.
- **`AudioControls.tsx`:** Acoustic mixer modal for adjusting drone balance, Tampuras, octave shift, and guide pitch volume.

### State & Persistence (`usePersistentState.ts`)
- Preserves user preferences (root pitch, volume levels, custom timing parameters, custom sequences, tonal settings) across app reloads via LocalStorage.

### Current Work-in-Progress & PRPs
- **PRP #0 - #10:** Archived in `# PRPs/xOlder/` (foundational audio, keyboard, visualizer, persistent state, session engine).
- **PRP #11 - #13 (Active):** Custom timings, audio latency & breathe hang fixes, tonal shaping for synths, Tampura sample integration, and Free Mode.

---

## 4. Recent Evolution

Recent commits introduced Tampura drone sample playback alongside Free Mode unguided audio, added tonal shaping parameters for synths (`ToneSettingsModal`), fixed audio latency issues, resolved keyboard selection bugs, and eliminated timer hang conditions during breath cycles.
