# Humm — Mobile Web App

> **Therapeutic Humming & Vagal Breathwork Guide**

**Humm** is a minimalist, mobile-first web application designed to pair the physiological and neurological benefits of therapeutic humming (vagal nerve stimulation, sinus nitric oxide release, parasympathetic activation) with gentle, reference-guided pitch sequences.

---

## 🌟 Key Features

* **Visual Breath Pacer:** 60 FPS animated breath ring (`BreathRing`) pacing through Inhale, Humming, and Resting cycles.
* **Peak Sinus Nitric Oxide (NO) Target:** Highlights $130\text{ Hz} - 150\text{ Hz}$ ($C_3 - D_3$) as the optimal frequency window for paranasal sinus ventilation and NO boost.
* **Dual Audio Engine:** Warm, lowpass-filtered background drone (Root + 5th) paired with monophonic guide tone melodies using Tone.js.
* **17-Key Touch Keyboard:** Interactive piano keyboard centered around root pitch with real-time active note glowing highlights.
* **Preset Protocols:**
  * **Vagal Calm:** Extended exhalation ($4\text{s}$ Inhale / $10\text{s}$ Hum / $4\text{s}$ Rest)
  * **Focus / Theta:** Shorter bursts ($3\text{s}$ Inhale / $6\text{s}$ Hum / $2\text{s}$ Rest)
  * **Sinus NO Recharge:** Prolonged hums with 3-minute recovery pause
* **Screen Wake Lock:** Prevents mobile display dimming during active sessions.

---

## 🚀 Tech Stack

* **Framework:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS v3 (Dark mode theme, mobile safe-area insets)
* **Audio:** Tone.js (Web Audio API wrapper with ADSR envelope smoothing)
* **Animations:** Framer Motion
* **Deployment:** GitHub Pages (Automated GitHub Actions)

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
