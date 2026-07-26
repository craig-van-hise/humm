# Product Requirements Document (PRD)

## Project: Humm — Mobile Web App

---

## 1. Executive Summary & Vision

**Resonance Hum** is a minimalist mobile-first web application designed to pair the physiological and neurological benefits of therapeutic humming (vagal stimulation, sinus nitric oxide release, parasympathetic activation) with gentle, reference-guided pitch sequences.

It functions simultaneously as a **guided breathwork tool** and a **low-impact vocal warmup app**. By generating a soft background drone and simple guide-tone melodies (2–4 notes) over customizable breathing cycles, the app helps users tune their voice naturally without vocal strain.

---

## 2. Target Use Cases & User Profiles

* **Vocalists & Public Speakers:** Warm up the vocal folds gently using closed-mouth resonance without glottal pressure or vocal fatigue.
* **Stress & Anxiety Relief:** Engage extended-exhalation humming to activate the vagal brake, boost Heart Rate Variability (HRV), and induce the Relaxation Response.
* **Sinus & Respiratory Health:** Utilize structured interval humming to maximize paranasal sinus nitric oxide (NO) production and ventilation.
* **Tinnitus & Focus Seekers:** Mask high-pitched tinnitus through internal bone-conducted resonance and promote brainwave entrainment (Theta/Gamma).

---

## 3. Functional Requirements

### 3.1 Pitch Setup & Vocal Range Calibration

* **Fundamental Key Picker:** Allows users to select their comfortable resting pitch (Root / $1$).
* Default range: $C_2$ to $C_5$.
* Default selection: $C_3$ (~130 Hz) for lower voices, $C_4$ (~261 Hz) for higher voices.


* **Resonance Recommendation Highlight:** Clearly tags $130\text{ Hz} - 150\text{ Hz}$ ($C_3 - D_3$) as the peak resonance frequency for paranasal sinus NO production.
* **Octave Adjuster:** Quick toggles to transpose sequences up or down an octave.

### 3.2 Audio Engine (Web Audio API / Tone.js)

* **Background Drone:** Warm, organic, low-frequency drone (Root + 5th) using triangle/sine waves with a gentle low-pass filter ($< 400\text{ Hz}$).
* **Guide Tone Synth:** Monophonic synth playing simple, non-jarring melodic lines (sine wave with soft attack/release).
* **Independent Volume Controls:** Dual sliders for Drone Volume and Guide Tone Lead Volume.
* **Mute Options:** Toggles to practice with *Drone Only*, *Guide Line Only*, or *Both*.

### 3.3 Note Sequences & Interval Pools

Sequences use simple durations (quarter, half, whole notes) at a slow tempo ($45 - 60\text{ BPM}$) with no ornaments or fast vibrato.

| Pool Category | Interval Set | Default Sequence | Practice Objective |
| --- | --- | --- | --- |
| **Gentle Micro-Tuning** | $[1, \flat 2, \flat 3]$ | $1 - \flat 2 - 1 - \flat 3 - 1$ | Micro-interval control, minimal vocal fold tension |
| **Resonance Anchor** | $[1, 5]$ | $1 - 5 - 1$ | Harmonic stabilization, interval jump clarity |
| **Triadic Foundation** | $[1, 3, 5]$ | $1 - 3 - 5 - 3 - 1$ | Smooth step-wise resonance across register |
| **Five-Note Slide** | $[1, 2, 3, 4, 5]$ | $1 - 2 - 3 - 4 - 5 - 4 - 3 - 2 - 1$ | Linear vocal connection and pitch continuity |

### 3.4 Breath Pacing & Timing Engine

Governs the structured cycle: **Inhale $\rightarrow$ Hum (Sequence Playback) $\rightarrow$ Rest/Pause**.

* **Preset Breath Modes:**
1. **Vagal Calm Mode (Extended Exhalation):** 4s Inhale, 10s Hum, 4s Rest.
2. **Focus / Theta Mode (Shorter Bursts):** 3s Inhale, 6s Hum, 2s Rest.
3. **Sinus NO Recharge Mode:** 2 consecutive prolonged hums (~10s each), followed by a mandatory **3-minute silent rest phase** (allowing sinus NO stores to replenish back to baseline).


* **Custom Rhythm Controls:** Sliders to adjust Inhale duration ($2-5\text{s}$), Hum duration ($6-15\text{s}$), and Rest duration ($0-10\text{s}$).
* **Session Timer:** 5 min, 10 min, 15 min, or Continuous.

### 3.5 Visual UI, Pacer & Real-Time Keyboard

The interface provides synchronized visual feedback:

* **Expanding Breath Ring:**
* Expands outward during **Inhale**.
* Vibrates with a soft pulse during **Hum**.
* Gently contracts/fades during **Rest**.


* **Active Pitch & Interval Indicator:** Text badge displaying the active degree ($1$, $\flat 2$, $3$, $5$) and note name ($C_3$, $D\flat_3$, $G_3$).
* **Visual Piano Keyboard Component:**
* Displays a 1-to-2 octave minimalist keyboard anchored around the chosen root note.
* **Highlighting:** Key lights up dynamically in real time as the guide synth plays that pitch.
* **Root Marker:** The fundamental root ($1$) is permanently tagged with a subtle accent dot for orientation.



---

## 4. Interface Architecture & Component Layout

```
 ┌─────────────────────────────────────────────────────────┐
 │                     RESONANCE HUM                       │
 │  [ ⚙️ Settings ]                   [ 🕒 Session: 08:30 ]│
 ├─────────────────────────────────────────────────────────┤
 │                                                         │
 │                   ┌─────────────────┐                   │
 │                   │                 │                   │
 │                   │   BREATH RING   │                   │
 │                   │   (ANIMATED)    │                   │
 │                   │                 │                   │
 │                   └─────────────────┘                   │
 │                      ACTION: HUM                        │
 │                                                         │
 │                    CURRENT NOTE: G3                     │
 │                   DEGREE: [ 5 ] (Fifth)                 │
 │                                                         │
 ├─────────────────────────────────────────────────────────┤
 │                 MINIMAL PIANO KEYBOARD                  │
 │   ┌─┬┬─┐ ┌─┬┬─┬┬─┐   ┌─┬┬─┐ ┌─┬┬─┬┬─┐                   │
 │   │ ││ │ │ ││ ││ │   │ ││ │ │ ││ ││ │                   │
 │   │█││█│ │█││█││█│   │ ││ │ │ ││ ││ │                   │
 │   └┬┴┬┴┘ └┬┴┬┴┬┴┬┘   └┬┴┬┴┘ └┬┴┬┴┬┴┬┘                   │
 │    │C3│D3 │E3│F3│G3*  │A3│B3 │C4│D4 │E4                 │
 │    ▲ Root       ▲ Active Note                           │
 ├─────────────────────────────────────────────────────────┤
 │  PRESETS: [ Vagal Calm ]  [ Sinus NO ]  [ Five-Note ]   │
 │                                                         │
 │  CONTROLS:                                              │
 │  [ ▶ START SESSION ]            [ 🔇 Drone ] [ 🎵 Guide] │
 └─────────────────────────────────────────────────────────┘

```

---

## 5. Technical Architecture & Data Schema

### 5.1 Tech Stack

* **Framework:** React / Next.js or Vue 3 (Single Page App architecture).
* **Styling:** Tailwind CSS (Optimized for mobile viewports, high contrast, dark mode default).
* **Audio Library:** `Tone.js` (Web Audio API wrapper for low-latency synthesis and scheduling).
* **Animations:** Framer Motion or CSS transitions synchronized with Tone.js `Transport`.

### 5.2 Core State & Data Schema

```typescript
interface AppState {
  // Calibration & Audio Settings
  rootNote: string; // e.g. "C3"
  octave: number; // e.g. 3
  droneVolume: number; // -60 to 0 dB
  guideVolume: number; // -60 to 0 dB
  
  // Timing Config
  tempoBpm: number; // 45 - 60 BPM
  inhaleSec: number; // e.g. 4
  humSec: number; // e.g. 10
  restSec: number; // e.g. 4
  
  // Active Playback State
  sessionState: 'idle' | 'inhale' | 'humming' | 'resting';
  activeNote: string | null; // e.g. "G3"
  activeDegree: string | null; // e.g. "5"
  
  // Sequence Config
  selectedPoolId: string; // "triadic"
  sequenceNotes: number[]; // Relative semitone offsets [0, 4, 7, 4, 0]
}

```

---

## 6. Non-Functional Requirements & Performance Standards

1. **Audio Latency & Smoothness:** Audio context must unlock cleanly on first user tap (handling iOS/Android Web Audio autoplay restrictions). Zero audio popping or clicking when switching notes.
2. **Mobile Screen Optimization:** Responsive layout with touch-friendly controls (minimum touch targets of $48\text{px} \times 48\text{px}$).
3. **Low Energy Consumption:** Minimal CPU utilization during long sessions to avoid heating mobile devices or draining battery.
4. **Offline Capability:** Progressive Web App (PWA) manifest and service worker implementation to allow full offline operation on mobile browsers.