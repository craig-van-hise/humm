import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SessionState, BreathMode, SequencePool } from './types';
import { BREATH_MODES, SEQUENCE_POOLS } from './components/SequenceSelector';
import { BreathRing } from './components/BreathRing';
import { PianoKeyboard } from './components/PianoKeyboard';
import { PitchPicker } from './components/PitchPicker';
import { SequenceSelector } from './components/SequenceSelector';
import { AudioControls } from './components/AudioControls';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useWakeLock } from './hooks/useWakeLock';
import { offsetNote } from './utils/pitchMath';
import { Sparkles, Clock, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export function App() {
  // Calibration & Pitch State
  const [rootNote, setRootNote] = useState<string>('C3');

  // Audio State
  const [droneVolume, setDroneVolume] = useState<number>(-12);
  const [guideVolume, setGuideVolume] = useState<number>(-6);
  const [isDroneMuted, setIsDroneMuted] = useState<boolean>(false);
  const [isGuideMuted, setIsGuideMuted] = useState<boolean>(false);

  // Breath & Sequence Config
  const [selectedBreathMode, setSelectedBreathMode] = useState<BreathMode>(BREATH_MODES[0]);
  const [selectedPool, setSelectedPool] = useState<SequencePool>(SEQUENCE_POOLS[0]);

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
    droneVolume,
    guideVolume,
    isDroneMuted,
    isGuideMuted,
  });

  // Screen Wake Lock
  useWakeLock(isSessionActive);

  // References for active cycle interval timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Total session stopwatch timer
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

  // Format stopwatch mm:ss
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

      // Play Melodic Sequence Steps during Hum duration
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
          // Loop back to next Inhale cycle
          runPacerCycle();
        }
      }, 1000);

      timerRef.current = restTimer;
    };
  }, [isSessionActive, selectedBreathMode, selectedPool, rootNote, playGuideNote]);

  // Trigger pacer when session toggles active
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

  // Handle single note tap on visual keyboard
  const handleKeyTouch = (noteName: string) => {
    playGuideNote(noteName, 1.2);
  };

  // Toggle Session state
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
      {/* Top Header Navigation Bar */}
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

          {/* Session Timer Badge */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTime(sessionElapsedSec)}</span>
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pb-8 pt-2 space-y-4">
        {/* Animated Breath Ring Visualizer */}
        <BreathRing
          sessionState={sessionState}
          activeNote={activeNote}
          activeDegree={activeDegree}
          rootNote={rootNote}
          progressPercent={phaseProgressPercent}
          phaseRemainingSec={phaseRemainingSec}
        />

        {/* 17-Key Touch Piano Keyboard */}
        <PianoKeyboard
          rootNote={rootNote}
          activeNote={activeNote}
          onKeyTouch={handleKeyTouch}
        />

        {/* Fundamental Pitch Selector */}
        <PitchPicker
          rootNote={rootNote}
          onSelectRoot={setRootNote}
        />

        {/* Sequence & Breath Mode Presets */}
        <SequenceSelector
          selectedBreathMode={selectedBreathMode.id}
          onSelectBreathMode={setSelectedBreathMode}
          selectedPoolId={selectedPool.id}
          onSelectSequencePool={setSelectedPool}
        />

        {/* Play/Pause & Audio Controls */}
        <AudioControls
          isSessionActive={isSessionActive}
          onToggleSession={handleToggleSession}
          droneVolume={droneVolume}
          onDroneVolumeChange={setDroneVolume}
          guideVolume={guideVolume}
          onGuideVolumeChange={setGuideVolume}
          isDroneMuted={isDroneMuted}
          onToggleDroneMute={() => setIsDroneMuted(!isDroneMuted)}
          isGuideMuted={isGuideMuted}
          onToggleGuideMute={() => setIsGuideMuted(!isGuideMuted)}
        />
      </main>

      {/* Mobile Footer */}
      <footer className="border-t border-slate-900 bg-[#0A0E17] py-3 text-center text-[11px] text-slate-500">
        Humm Mobile Web App &bull; Paranasal Sinus NO & Vagal Activation Tool
      </footer>
    </div>
  );
}
