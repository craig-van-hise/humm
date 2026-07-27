import { useState, useRef, useEffect, useCallback } from 'react';
import { degreeToFrequency, degreeToNoteName } from '../utils/pitchMath';

export type SessionPhase = 'ready' | 'inhale' | 'humming' | 'resting';

interface SessionEngineConfig {
  rootNote: string;
  degrees: string[]; // Active pattern, e.g. ["1", "7v", "1"]
  inhaleSec: number;
  restSec: number;
  noteDurationSec: number;
  onPlayPitch: (pitch: number | string, durationSec: number) => void;
  onStopAudio: () => void;
}

export function useSessionEngine({
  rootNote,
  degrees,
  inhaleSec,
  restSec,
  noteDurationSec,
  onPlayPitch,
  onStopAudio,
}: SessionEngineConfig) {
  const [activePhase, setActivePhase] = useState<SessionPhase>('ready');
  const [pitchStepIndex, setPitchStepIndex] = useState(0);
  const [activeNoteName, setActiveNoteName] = useState<string | null>(null);
  const [activeDegree, setActiveDegree] = useState<string | null>(null);

  // Timer refs to allow instant cancellation
  const mainPhaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pitchIntervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  // Helper to clear all active JS timers
  const clearAllTimers = useCallback(() => {
    if (mainPhaseTimerRef.current) clearTimeout(mainPhaseTimerRef.current);
    if (pitchIntervalTimerRef.current) clearTimeout(pitchIntervalTimerRef.current);
  }, []);

  // 1. Play Pitch Sequence (Step-by-step during 'humming' phase)
  const runPitchSequence = useCallback(
    (stepIdx: number) => {
      if (!isRunningRef.current) return;

      if (stepIdx < degrees.length) {
        const currentDegree = degrees[stepIdx];
        const freq = degreeToFrequency(rootNote, currentDegree);
        const noteName = degreeToNoteName(rootNote, currentDegree);

        setPitchStepIndex(stepIdx);
        setActiveDegree(currentDegree);
        setActiveNoteName(noteName);

        // Play synth tone for this note
        onPlayPitch(freq, noteDurationSec);

        // Schedule next note in pattern
        pitchIntervalTimerRef.current = setTimeout(() => {
          runPitchSequence(stepIdx + 1);
        }, noteDurationSec * 1000);
      }
    },
    [degrees, rootNote, noteDurationSec, onPlayPitch]
  );

  // 2. Main Phase Lifecycle State Machine
  const startPhase = useCallback(
    (phase: SessionPhase) => {
      if (!isRunningRef.current) return;

      clearAllTimers();
      setActivePhase(phase);

      if (phase === 'inhale') {
        setActiveNoteName(null);
        setActiveDegree(null);

        // Transition to 'humming' after inhaleSec
        mainPhaseTimerRef.current = setTimeout(() => {
          startPhase('humming');
        }, inhaleSec * 1000);
      } else if (phase === 'humming') {
        // Start playing notes from index 0
        runPitchSequence(0);

        // Total hum time = noteDurationSec * number of notes
        const totalHumSec = noteDurationSec * degrees.length;

        // Transition to 'resting' (or 'inhale' if restSec is 0) after hum finishes
        mainPhaseTimerRef.current = setTimeout(() => {
          if (restSec > 0) {
            startPhase('resting');
          } else {
            startPhase('inhale');
          }
        }, totalHumSec * 1000);
      } else if (phase === 'resting') {
        setActiveNoteName(null);
        setActiveDegree(null);

        // Transition back to 'inhale' after restSec
        mainPhaseTimerRef.current = setTimeout(() => {
          startPhase('inhale');
        }, restSec * 1000);
      }
    },
    [inhaleSec, restSec, noteDurationSec, degrees.length, runPitchSequence, clearAllTimers]
  );

  // 3. Start Session
  const startSession = useCallback(() => {
    isRunningRef.current = true;
    startPhase('inhale');
  }, [startPhase]);

  // 4. Stop Session (Instant Termination)
  const stopSession = useCallback(() => {
    isRunningRef.current = false;
    clearAllTimers();
    onStopAudio();

    setActivePhase('ready');
    setPitchStepIndex(0);
    setActiveNoteName(null);
    setActiveDegree(null);
  }, [clearAllTimers, onStopAudio]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Determine current active phase duration for BreathRing transition prop
  const getCurrentPhaseDuration = () => {
    if (activePhase === 'inhale') return inhaleSec;
    if (activePhase === 'humming') return noteDurationSec * degrees.length;
    if (activePhase === 'resting') return restSec;
    return 0;
  };

  return {
    activePhase,
    pitchStepIndex,
    activeNoteName,
    activeDegree,
    phaseDurationSec: getCurrentPhaseDuration(),
    startSession,
    stopSession,
  };
}
