import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SessionState, BreathMode, SequencePool } from './types';
import { DEFAULT_BREATH_MODES, DEFAULT_SEQUENCE_POOLS, SequenceSelector } from './components/SequenceSelector';
import { BreathRing } from './components/BreathRing';
import { PianoKeyboard } from './components/PianoKeyboard';
import { PitchPicker } from './components/PitchPicker';
import { AudioControls } from './components/AudioControls';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useWakeLock } from './hooks/useWakeLock';
import { offsetNote } from './utils/pitchMath';
import { Sparkles, Clock } from 'lucide-react';

export function App() {
  // Calibration & Pitch State
  const [rootNote, setRootNote] = useState<string>('C3');

  // Audio State (0 to 1 scales)
  const [droneRootVol, setDroneRootVol] = useState<number>(0.35);
  const [droneFifthVol, setDroneFifthVol] = useState<number>(0.25);
  const [guideVol, setGuideVol] = useState<number>(0.65);

  // Breath & Sequence Config
  const [selectedBreathMode, setSelectedBreathMode] = useState<BreathMode>(DEFAULT_BREATH_MODES[0]);
  const [presets, setPresets] = useState<SequencePool[]>(() => {
    const saved = localStorage.getItem('humm_custom_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_SEQUENCE_POOLS, ...parsed];
      } catch (err) {
        console.warn('Failed to parse saved presets:', err);
      }
    }
    return DEFAULT_SEQUENCE_POOLS;
  });

  const [selectedPool, setSelectedPool] = useState<SequencePool>(DEFAULT_SEQUENCE_POOLS[0]);

  // Active Playback State
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [activeDegree, setActiveDegree] = useState<string | null>(null);

  // Session Timers
  const [sessionElapsedSec, setSessionElapsedSec] = useState<number>(0);
  const [phaseRemainingSec, setPhaseRemainingSec] = useState<number>(0);
  const [phaseProgressPercent, setPhaseProgressPercent] = useState<number>(0);

  // Audio Engine Hook
  const { playGuideNote, initEngine } = useAudioEngine({
    rootNote,
    isSessionActive,
    droneRootVol,
    droneFifthVol,
    guideVol,
  });

  // Screen Wake Lock
  useWakeLock(isSessionActive);

  // References for active cycle interval timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Presets Management
  const handleAddPreset = (newPreset: SequencePool) => {
    const updated = [...presets, newPreset];
    setPresets(updated);
    setSelectedPool(newPreset);

    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem('humm_custom_presets', JSON.stringify(customOnly));
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    if (selectedPool.id === id) {
      setSelectedPool(updated[0] || DEFAULT_SEQUENCE_POOLS[0]);
    }

    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem('humm_custom_presets', JSON.stringify(customOnly));
  };

  // Stopwatch timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionElapsedSec((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Main Pacer Loop execution
  const runPacerCycle = useCallback(() => {
    if (!isSessionActive) return;

    // 1. INHALE PHASE
    setSessionState('inhale');
    setActiveNote(null);
    setActiveDegree(null);

    const inhaleDuration = selectedBreathMode.inhaleSec;
    const humDuration = selectedBreathMode.humSec;
    const restDuration = selectedBreathMode.restSec;

    let elapsed = 0;
    setPhaseRemainingSec(inhaleDuration);
    setPhaseProgressPercent(0);

    const inhaleInterval = setInterval(() => {
      elapsed += 1;
      setPhaseRemainingSec(Math.max(0, inhaleDuration - elapsed));
      setPhaseProgressPercent((elapsed / inhaleDuration) * 100);

      if (elapsed >= inhaleDuration) {
        clearInterval(inhaleInterval);
        startHumPhase();
      }
    }, 1000);

    timerRef.current = inhaleInterval;

    // 2. HUMMING PHASE
    const startHumPhase = () => {
      setSessionState('humming');
      let humElapsed = 0;
      setPhaseRemainingSec(humDuration);
      setPhaseProgressPercent(0);

      const notes = selectedPool.intervalOffsets;
      const degrees = selectedPool.intervalDegrees;
      const stepTimeSec = humDuration / notes.length;

      let currentStep = 0;

      const triggerStepNote = (stepIdx: number) => {
        if (stepIdx < notes.length) {
          const semitones = notes[stepIdx];
          const noteName = offsetNote(rootNote, semitones);
          setActiveNote(noteName);
          setActiveDegree(degrees[stepIdx]);
          playGuideNote(noteName, stepTimeSec);
        }
      };

      triggerStepNote(0);

      const sequenceInterval = setInterval(() => {
        currentStep += 1;
        if (currentStep < notes.length) {
          triggerStepNote(currentStep);
        }
      }, stepTimeSec * 1000);

      stepTimerRef.current = sequenceInterval;

      const humTimer = setInterval(() => {
        humElapsed += 1;
        setPhaseRemainingSec(Math.max(0, humDuration - humElapsed));
        setPhaseProgressPercent((humElapsed / humDuration) * 100);

        if (humElapsed >= humDuration) {
          clearInterval(humTimer);
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          startRestPhase();
        }
      }, 1000);

      timerRef.current = humTimer;
    };

    // 3. RESTING PHASE
    const startRestPhase = () => {
      setSessionState('resting');
      setActiveNote(null);
      setActiveDegree(null);

      let restElapsed = 0;
      setPhaseRemainingSec(restDuration);
      setPhaseProgressPercent(0);

      const restTimer = setInterval(() => {
        restElapsed += 1;
        setPhaseRemainingSec(Math.max(0, restDuration - restElapsed));
        setPhaseProgressPercent((restElapsed / restDuration) * 100);

        if (restElapsed >= restDuration) {
          clearInterval(restTimer);
          runPacerCycle();
        }
      }, 1000);

      timerRef.current = restTimer;
    };
  }, [isSessionActive, selectedBreathMode, selectedPool, rootNote, playGuideNote]);

  useEffect(() => {
    if (isSessionActive) {
      runPacerCycle();
    } else {
      setSessionState('idle');
      setActiveNote(null);
      setActiveDegree(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isSessionActive, runPacerCycle]);

  // Toggle Session state (triggered when tapping BreathRing)
  const handleToggleSession = async () => {
    if (!isSessionActive) {
      await initEngine();
      setIsSessionActive(true);
    } else {
      setIsSessionActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0E17]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                HUMM
              </h1>
              <p className="text-[10px] text-cyan-400/90 font-medium tracking-tight">
                Vagal & Sinus Resonance Guide
              </p>
            </div>
          </div>

          {/* Stopwatch */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTime(sessionElapsedSec)}</span>
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pb-8 pt-2 space-y-4">
        {/* Interactive Breath Ring Circle */}
        <BreathRing
          isSessionActive={isSessionActive}
          onToggleSession={handleToggleSession}
          sessionState={sessionState}
          activeNote={activeNote}
          activeDegree={activeDegree}
          rootNote={rootNote}
          progressPercent={phaseProgressPercent}
          phaseRemainingSec={phaseRemainingSec}
        />

        {/* 14-White / 10-Black Seam-Centered Piano Keyboard */}
        <PianoKeyboard
          rootNote={rootNote}
          activeNote={activeNote}
          onSelectRoot={setRootNote}
        />

        {/* Fundamental Pitch Selector */}
        <PitchPicker
          rootNote={rootNote}
          onSelectRoot={setRootNote}
        />

        {/* Sequence & Breath Mode Presets (Horizontal Carousel) */}
        <SequenceSelector
          selectedBreathMode={selectedBreathMode.id}
          onSelectBreathMode={setSelectedBreathMode}
          presets={presets}
          selectedPoolId={selectedPool.id}
          onSelectSequencePool={setSelectedPool}
          onAddPreset={handleAddPreset}
          onDeletePreset={handleDeletePreset}
        />

        {/* Audio Mix Controls */}
        <AudioControls
          droneRootVol={droneRootVol}
          setDroneRootVol={setDroneRootVol}
          droneFifthVol={droneFifthVol}
          setDroneFifthVol={setDroneFifthVol}
          guideVol={guideVol}
          setGuideVol={setGuideVol}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0A0E17] py-3 text-center text-[11px] text-slate-500">
        Humm Mobile Web App &bull; Paranasal Sinus NO & Vagal Activation Tool
      </footer>
    </div>
  );
}
