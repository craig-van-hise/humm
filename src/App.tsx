import React, { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_SEQUENCE_PRESETS,
  SequenceSelector,
  SequencePreset,
} from './components/SequenceSelector';
import { PacingModeSelector, PacingPresetId } from './components/PacingModeSelector';
import { BreathRing } from './components/BreathRing';
import { PianoKeyboard } from './components/PianoKeyboard';
import { AudioControls } from './components/AudioControls';
import { TimingSettingsModal, TimingSettings } from './components/TimingSettingsModal';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useSessionEngine } from './hooks/useSessionEngine';
import { usePersistentState } from './hooks/usePersistentState';
import { useWakeLock } from './hooks/useWakeLock';
import { Sparkles, Clock } from 'lucide-react';

export function App() {
  // Persistent Calibration & Settings
  const [rootNote, setRootNote] = usePersistentState<string>('rootNote', 'C3');
  const [droneOctaveOffset, setDroneOctaveOffset] = usePersistentState<number>('droneOctaveOffset', -1);

  // Audio State (0 to 1 scales)
  const [droneRootVol, setDroneRootVol] = usePersistentState<number>('droneRootVol', 0.6);
  const [droneFifthVol, setDroneFifthVol] = usePersistentState<number>('droneFifthVol', 0.35);
  const [guideVol, setGuideVol] = usePersistentState<number>('guideVol', 0.9);

  // Pacing Protocol & Sequence Config
  const [selectedPacingMode, setSelectedPacingMode] = usePersistentState<PacingPresetId>(
    'pacingMode',
    'vagal-calm'
  );
  const [presets, setPresets] = usePersistentState<SequencePreset[]>('presets', DEFAULT_SEQUENCE_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = usePersistentState<string>('selectedPresetId', DEFAULT_SEQUENCE_PRESETS[0].id);

  // Timing Modal & Custom Settings
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [timingSettings, setTimingSettings] = usePersistentState<TimingSettings>('timingSettings', {
    mode: 'fixed-note',
    inhaleSec: 4,
    totalHumSec: 10,
    noteSec: 2.5,
    restSec: 4,
  });

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0] || DEFAULT_SEQUENCE_PRESETS[0];

  // Session Timers
  const [sessionElapsedSec, setSessionElapsedSec] = useState<number>(0);

  // Derive active timing based on selected pacing mode
  const sequenceNoteCount = selectedPreset.degrees.length;

  const getActiveTimings = useCallback(() => {
    switch (selectedPacingMode) {
      case 'vagal-calm':
        return { inhaleSec: 4, restSec: 4, noteDurationSec: 2.0 };
      case 'focus-theta':
        return { inhaleSec: 3, restSec: 2, noteDurationSec: 1.2 };
      case 'sinus-recharge':
        return { inhaleSec: 4, restSec: 180, noteDurationSec: 2.0 };
      case 'custom':
        const noteDurationSec =
          timingSettings.mode === 'fixed-note'
            ? timingSettings.noteSec
            : timingSettings.totalHumSec / Math.max(1, sequenceNoteCount);
        return {
          inhaleSec: timingSettings.inhaleSec,
          restSec: timingSettings.restSec,
          noteDurationSec,
        };
    }
  }, [selectedPacingMode, timingSettings, sequenceNoteCount]);

  const activeTimings = getActiveTimings();

  // Audio Engine Hook
  const { playGuideNote, initEngine, startDrone, stopAllAudio } = useAudioEngine({
    rootNote,
    droneOctaveOffset,
    droneRootVol,
    droneFifthVol,
    guideVol,
  });

  // Session State Engine Hook
  const session = useSessionEngine({
    rootNote,
    degrees: selectedPreset.degrees,
    inhaleSec: activeTimings.inhaleSec,
    restSec: activeTimings.restSec,
    noteDurationSec: activeTimings.noteDurationSec,
    onPlayPitch: playGuideNote,
    onStopAudio: stopAllAudio,
  });

  // Screen Wake Lock
  useWakeLock(session.activePhase !== 'ready');

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
    if (session.activePhase !== 'ready') {
      interval = setInterval(() => {
        setSessionElapsedSec((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.activePhase]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Session state (triggered when tapping BreathRing)
  const handleToggleSession = async () => {
    if (session.activePhase === 'ready') {
      await initEngine();
      await startDrone();
      session.startSession();
    } else {
      session.stopSession();
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
          isActive={session.activePhase !== 'ready'}
          onToggleSession={handleToggleSession}
          rootNote={rootNote}
          activePhase={session.activePhase}
          phaseDuration={session.phaseDurationSec}
          activeNoteName={session.activeNoteName}
          activeDegree={session.activeDegree}
          pitchDurationSec={activeTimings.noteDurationSec}
          pitchStepIndex={session.pitchStepIndex}
        />

        {/* 14-White / 10-Black Seam-Centered Piano Keyboard */}
        <PianoKeyboard
          rootNote={rootNote}
          activeNote={session.activeNoteName}
          onSelectRoot={setRootNote}
        />

        {/* Breath Pacing Protocols */}
        <PacingModeSelector
          selectedMode={selectedPacingMode}
          onSelectMode={setSelectedPacingMode}
          customSettings={timingSettings}
          onOpenCustomModal={() => setIsTimingModalOpen(true)}
          sequenceNoteCount={sequenceNoteCount}
        />

        {/* Melodic Sequence Presets */}
        <SequenceSelector
          presets={presets}
          selectedId={selectedPreset.id}
          onSelect={(id) => setSelectedPresetId(id)}
          onAddPreset={handleAddPreset}
          onEditPreset={handleEditPreset}
          onDeletePreset={handleDeletePreset}
          onResetDefaults={handleResetDefaults}
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
