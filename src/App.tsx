import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SessionState, BreathMode } from './types';
import {
  DEFAULT_BREATH_MODES,
  DEFAULT_SEQUENCE_PRESETS,
  SequenceSelector,
  SequencePreset,
} from './components/SequenceSelector';
import { BreathRing } from './components/BreathRing';
import { PianoKeyboard } from './components/PianoKeyboard';
import { PitchPicker } from './components/PitchPicker';
import { AudioControls } from './components/AudioControls';
import { TimingSettingsModal, TimingSettings } from './components/TimingSettingsModal';
import { useAudioEngine } from './hooks/useAudioEngine';
import { usePersistentState } from './hooks/usePersistentState';
import { useWakeLock } from './hooks/useWakeLock';
import { offsetNote, degreeToSemitones } from './utils/pitchMath';
import { Sparkles, Clock } from 'lucide-react';

export function App() {
  // Persistent Calibration & Settings
  const [rootNote, setRootNote] = usePersistentState<string>('rootNote', 'C3');
  const [droneOctaveOffset, setDroneOctaveOffset] = usePersistentState<number>('droneOctaveOffset', -1);

  // Audio State (0 to 1 scales)
  const [droneRootVol, setDroneRootVol] = usePersistentState<number>('droneRootVol', 0.6);
  const [droneFifthVol, setDroneFifthVol] = usePersistentState<number>('droneFifthVol', 0.35);
  const [guideVol, setGuideVol] = usePersistentState<number>('guideVol', 0.9);

  // Breath & Sequence Config
  const [selectedBreathMode, setSelectedBreathMode] = useState<BreathMode>(DEFAULT_BREATH_MODES[0]);
  const [presets, setPresets] = usePersistentState<SequencePreset[]>('presets', DEFAULT_SEQUENCE_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = usePersistentState<string>('selectedPresetId', DEFAULT_SEQUENCE_PRESETS[0].id);

  // Timing Modal & Settings
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [timingSettings, setTimingSettings] = usePersistentState<TimingSettings>('timingSettings', {
    mode: 'fixed-note',
    inhaleSec: 4,
    totalHumSec: 10,
    noteSec: 2.5,
    restSec: 4,
  });

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0] || DEFAULT_SEQUENCE_PRESETS[0];

  const handleSelectBreathMode = (mode: BreathMode) => {
    setSelectedBreathMode(mode);
    setTimingSettings((prev) => ({
      ...prev,
      inhaleSec: mode.inhaleSec,
      totalHumSec: mode.humSec,
      restSec: mode.restSec,
    }));
  };

  // Active Playback State
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [activeDegree, setActiveDegree] = useState<string | null>(null);

  // Smooth pitch timing for BreathRing
  const [pitchDurationSec, setPitchDurationSec] = useState<number>(2.0);
  const [pitchStepIndex, setPitchStepIndex] = useState<number>(0);
  const [currentPhaseDuration, setCurrentPhaseDuration] = useState<number>(4.0);

  // Session Timers
  const [sessionElapsedSec, setSessionElapsedSec] = useState<number>(0);

  // Audio Engine Hook
  const { playGuideNote, initEngine } = useAudioEngine({
    rootNote,
    droneOctaveOffset,
    droneRootVol,
    droneFifthVol,
    guideVol,
    isSessionActive,
  });

  // Screen Wake Lock
  useWakeLock(isSessionActive);

  // References for active cycle interval timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Presets Management
  const handleAddPreset = (newPreset: SequencePreset) => {
    const updated = [...presets, newPreset];
    setPresets(updated);
    setSelectedPresetId(newPreset.id);
  };

  const handleEditPreset = (updatedPreset: SequencePreset) => {
    const updated = presets.map((p) => (p.id === updatedPreset.id ? updatedPreset : p));
    setPresets(updated);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    if (selectedPresetId === id) {
      setSelectedPresetId(updated[0]?.id || DEFAULT_SEQUENCE_PRESETS[0].id);
    }
  };

  const handleResetDefaults = () => {
    setPresets(DEFAULT_SEQUENCE_PRESETS);
    setSelectedPresetId(DEFAULT_SEQUENCE_PRESETS[0].id);
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

  // Calculate dynamic timing parameters
  const sequenceNoteCount = selectedPreset.degrees.length;

  const actualNoteDurationSec =
    timingSettings.mode === 'fixed-note'
      ? timingSettings.noteSec
      : timingSettings.totalHumSec / Math.max(1, sequenceNoteCount);

  const actualTotalHumSec =
    timingSettings.mode === 'fixed-note'
      ? timingSettings.noteSec * sequenceNoteCount
      : timingSettings.totalHumSec;

  // Main Pacer Loop execution
  const runPacerCycle = useCallback(() => {
    if (!isSessionActive) return;

    // 1. INHALE PHASE
    setSessionState('inhale');
    setActiveNote(null);
    setActiveDegree(null);

    const inhaleDuration = timingSettings.inhaleSec;
    const humDuration = actualTotalHumSec;
    const restDuration = timingSettings.restSec;

    setCurrentPhaseDuration(inhaleDuration);

    const inhaleTimeout = setTimeout(() => {
      startHumPhase();
    }, inhaleDuration * 1000);

    timerRef.current = inhaleTimeout;

    // 2. HUMMING PHASE
    const startHumPhase = () => {
      setSessionState('humming');
      setCurrentPhaseDuration(humDuration);

      const degrees = selectedPreset.degrees;
      const offsets = degrees.map(degreeToSemitones);
      const stepTimeSec = actualNoteDurationSec;
      setPitchDurationSec(stepTimeSec);

      let currentStep = 0;

      const triggerStepNote = (stepIdx: number) => {
        if (stepIdx < degrees.length) {
          const semitones = offsets[stepIdx];
          const noteName = offsetNote(rootNote, semitones);
          setActiveNote(noteName);
          setActiveDegree(degrees[stepIdx]);
          setPitchStepIndex(stepIdx);
          playGuideNote(noteName, stepTimeSec);
        }
      };

      triggerStepNote(0);

      const sequenceInterval = setInterval(() => {
        currentStep += 1;
        if (currentStep < degrees.length) {
          triggerStepNote(currentStep);
        } else {
          clearInterval(sequenceInterval);
        }
      }, stepTimeSec * 1000);

      stepTimerRef.current = sequenceInterval;

      const humTimeout = setTimeout(() => {
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        startRestPhase();
      }, humDuration * 1000);

      timerRef.current = humTimeout;
    };

    // 3. RESTING PHASE
    const startRestPhase = () => {
      setSessionState('resting');
      setActiveNote(null);
      setActiveDegree(null);
      setCurrentPhaseDuration(restDuration);

      const restTimeout = setTimeout(() => {
        runPacerCycle();
      }, restDuration * 1000);

      timerRef.current = restTimeout;
    };
  }, [isSessionActive, timingSettings, actualTotalHumSec, actualNoteDurationSec, selectedPreset, rootNote, playGuideNote]);

  useEffect(() => {
    if (isSessionActive) {
      runPacerCycle();
    } else {
      setSessionState('idle');
      setActiveNote(null);
      setActiveDegree(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
          isActive={isSessionActive}
          onToggleSession={handleToggleSession}
          rootNote={rootNote}
          activePhase={isSessionActive ? sessionState : 'ready'}
          phaseDuration={currentPhaseDuration}
          activeNoteName={activeNote}
          activeDegree={activeDegree}
          pitchDurationSec={pitchDurationSec}
          pitchStepIndex={pitchStepIndex}
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

        {/* Sequence & Breath Mode Presets */}
        <SequenceSelector
          selectedBreathMode={selectedBreathMode.id}
          onSelectBreathMode={handleSelectBreathMode}
          presets={presets}
          selectedId={selectedPreset.id}
          onSelect={(id) => setSelectedPresetId(id)}
          onAddPreset={handleAddPreset}
          onEditPreset={handleEditPreset}
          onDeletePreset={handleDeletePreset}
          onResetDefaults={handleResetDefaults}
          onOpenTimingModal={() => setIsTimingModalOpen(true)}
        />

        {/* Audio Mix Controls */}
        <AudioControls
          droneOctaveOffset={droneOctaveOffset}
          setDroneOctaveOffset={setDroneOctaveOffset}
          droneRootVol={droneRootVol}
          setDroneRootVol={setDroneRootVol}
          droneFifthVol={droneFifthVol}
          setDroneFifthVol={setDroneFifthVol}
          guideVol={guideVol}
          setGuideVol={setGuideVol}
        />

        {/* Custom Pacing & Timing Modal Drawer */}
        <TimingSettingsModal
          isOpen={isTimingModalOpen}
          onClose={() => setIsTimingModalOpen(false)}
          settings={timingSettings}
          onUpdate={setTimingSettings}
          sequenceNoteCount={sequenceNoteCount}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0A0E17] py-3 text-center text-[11px] text-slate-500">
        Humm Mobile Web App &bull; Paranasal Sinus NO & Vagal Activation Tool
      </footer>
    </div>
  );
}
