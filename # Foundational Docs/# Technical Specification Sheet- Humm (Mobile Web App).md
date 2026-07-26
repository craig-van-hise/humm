# Technical Specification Sheet: Humm (Mobile Web App)

---

## 1. Development & Deployment Workflow

```text
┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│   macOS Local Dev Host   │ ───► │  GitHub Repository Push  │ ───► │   GitHub Pages Deploy    │
│  http://localhost:5173   │      │  (main branch / CI)      │      │ https://<user>.github.io │
└──────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
                                                                                 │
                                                                                 ▼
                                                                    ┌──────────────────────────┐
                                                                    │   Target Device: iPhone  │
                                                                    │  (Mobile Safari / Chrome)│
                                                                    └──────────────────────────┘

```

---

## 2. Tech Stack & Dependencies

| Layer | Tool / Library | Specification & Role |
| --- | --- | --- |
| **Build Tool** | **Vite + React 18 (TS)** | Ultra-fast local HMR on macOS; optimized production bundles |
| **Styling** | **Tailwind CSS v3** | Mobile-first CSS, dark mode default, touch target sizing, safe-area support |
| **Audio Engine** | **Tone.js** | Web Audio API wrapper handling real-time synth, drone scheduling, and unlock events |
| **Animation Engine** | **Framer Motion** | 60 FPS vector animations for the breath/hum visual pacer |
| **Deployment** | **`gh-pages` / GitHub Actions** | Automated static build publishing to GitHub Pages |

---

## 3. Project Directory Structure

```text
humm/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages build & deploy
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.webmanifest      # Mobile PWA manifest (Install to Home Screen)
├── src/
│   ├── components/
│   │   ├── BreathRing.tsx        # Framer Motion animated breath/hum ring
│   │   ├── PianoKeyboard.tsx     # 17-key interactive keyboard (active note highlight)
│   │   ├── PitchPicker.tsx       # Root pitch selector (130–150 Hz resonance highlight)
│   │   ├── SequenceSelector.tsx  # Note pool & sequence preset selector
│   │   └── AudioControls.tsx     # Volume sliders & start/pause controls
│   ├── hooks/
│   │   ├── useAudioEngine.ts     # Tone.js drone + guide synth state management
│   │   └── useWakeLock.ts        # Screen Wake Lock API hook
│   ├── utils/
│   │   ├── pitchMath.ts          # MIDI pitch to Hz & musical interval calculations
│   │   └── audioContext.ts       # iOS Safari audio unlock helper
│   ├── types/
│   │   └── index.ts              # App State, Interval Pools, & Sequence types
│   ├── App.tsx                   # Main mobile viewport layout
│   ├── main.tsx                  # Vite entry point
│   └── index.css                 # Tailwind directives + mobile safe areas
├── package.json
├── tailwind.config.js
└── vite.config.ts                # Configured with `base: '/humm/'` for GitHub Pages

```

---

## 4. GitHub Pages Deployment Configuration

### 4.1 Vite Base Path Configuration (`vite.config.ts`)

Because GitHub Pages serves your site at `https://<your-username>.github.io/humm/`, Vite must resolve assets relative to the repository path.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Matches your GitHub repo name EXACTLY
  base: process.env.NODE_ENV === 'production' ? '/humm/' : '/',
  plugins: [react()],
});

```

### 4.2 Deployment Method Options

#### Option A: Automated GitHub Action (Recommended)

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy Humm to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/node-dev@v4
        with:
          node-version: 20
      - name: Install Dependencies
        run: npm ci
      - name: Build App
        run: npm run build
      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

#### Option B: Manual CLI Script (`gh-pages` package)

Add the `deploy` script in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

```

---

## 5. Mobile Audio Engine Architecture (`Tone.js`)

Mobile browsers—especially **iOS Safari**—block Web Audio playback until an explicit user touch event occurs.

```text
               ┌───────────────────────┐
               │   Tone.OmniOscillator │
               │  (Drone: Sine/Tri Mix)│ ──► Tone.Filter (Lowpass 380Hz) ─┐
               └───────────────────────┘                                 │
                                                                         ▼
┌───────────┐  ┌───────────────────────┐                        ┌────────────────┐
│ Touch Tap │─►│      Tone.Synth       │───────────────────────►│ Tone.Destination│
│ (Unlock)  │  │  (Guide Tone: Sine)   │                        │ (Mobile Output)│
└───────────┘  └───────────────────────┘                        └────────────────┘

```

### 5.1 Mobile Web Audio Safeguards

1. **Explicit Unlock Hook:** The `Start Session` button invokes `await Tone.start()`. Audio context state is verified before scheduling drone/synth notes.
2. **ADSR Envelope Smoothing:**
* Attack: `0.08s` (soft start)
* Decay: `0.1s`
* Sustain: `0.85`
* Release: `0.15s` (eliminates digital pops/clicks on iPhone internal speakers)


3. **Screen Wake Lock:** Utilizes `navigator.wakeLock.request('screen')` during active session to prevent the iPhone display from dimming or locking mid-exercise.

---

## 6. Visual Component Specifications

### 6.1 Interactive Piano Keyboard Component (`PianoKeyboard.tsx`)

* **Range:** 17 Keys ($C_2$ to $E_4$).
* **Touch Optimization:** Uses `onTouchStart` event handlers alongside `onClick` to bypass $300\text{ms}$ tap delays on iOS Safari.
* **Key Highlighting:**
* **Root Accent:** A small cyan/gold dot marks the active fundamental pitch ($1$).
* **Active Note:** Highlighted in real time with a glowing teal gradient whenever the guide tone synth plays that note.



### 6.2 Animated Breath Visualizer (`BreathRing.tsx`)

* **Inhale Phase:** Ring expands smoothly over `inhaleDuration` ($2 - 5\text{s}$).
* **Hum Phase:** Ring maintains max size while a subtle radial ripple/pulse triggers at $60\text{ FPS}$ to encourage closed-mouth vocal resonance.
* **Rest Phase:** Ring contracts back to baseline over `restDuration` ($0 - 10\text{s}$).

---

## 7. Complete Mac Setup & Deployment Script

Run these terminal commands on your Mac to create, test, and deploy the project:

```bash
# 1. Create Vite React + TypeScript app
npm create vite@latest humm -- --template react-ts

# 2. Enter project directory
cd humm

# 3. Install core dependencies
npm install tone framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer gh-pages

# 4. Initialize Tailwind CSS
npx tailwindcss init -p

# 5. Test locally on Mac browser
npm run dev
# App will run at: http://localhost:5173

# 6. Deploy to GitHub Pages (Manual CLI method)
npm run deploy
# App will publish to: https://<your-username>.github.io/humm/

```