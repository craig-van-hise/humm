import React from 'react';
import { X, Sliders, Lock, Unlock } from 'lucide-react';

export interface TimingSettings {
  mode: 'fixed-total' | 'fixed-note'; // Fixed total hum vs. Fixed duration per note
  inhaleSec: number;
  totalHumSec: number;
  noteSec: number; // Used in 'fixed-note' mode
  restSec: number;
}

export interface TimingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimingSettings;
  onUpdate: (updated: TimingSettings) => void;
  sequenceNoteCount: number;
}

export const TimingSettingsModal: React.FC<TimingSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
  sequenceNoteCount,
}) => {
  if (!isOpen) return null;

  const calculatedTotalHum =
    settings.mode === 'fixed-note'
      ? settings.noteSec * sequenceNoteCount
      : settings.totalHumSec;

  const calculatedNoteDuration =
    settings.mode === 'fixed-note'
      ? settings.noteSec
      : settings.totalHumSec / Math.max(1, sequenceNoteCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Custom Breath & Pattern Timing
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Pacing Mode</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onUpdate({ ...settings, mode: 'fixed-total' })}
              className={`flex items-center justify-center gap-1.5 text-xs py-2 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                settings.mode === 'fixed-total'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              Fixed Total Time
            </button>

            <button
              onClick={() => onUpdate({ ...settings, mode: 'fixed-note' })}
              className={`flex items-center justify-center gap-1.5 text-xs py-2 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                settings.mode === 'fixed-note'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3 h-3" />
              Fixed Note Length
            </button>
          </div>
        </div>

        {/* Dynamic Timing Info Card */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Current Pattern Length:</span>
            <span className="font-mono text-cyan-400">{sequenceNoteCount} Notes</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Duration per Note:</span>
            <span className="font-mono text-amber-400">{calculatedNoteDuration.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total Humming Phase:</span>
            <span className="font-mono text-cyan-400">{calculatedTotalHum.toFixed(1)}s</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* 1. Inhale Duration */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Inhale Duration</span>
              <span className="font-mono text-sky-400">{settings.inhaleSec}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={settings.inhaleSec}
              onChange={(e) => onUpdate({ ...settings, inhaleSec: parseFloat(e.target.value) })}
              className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 2. Mode Specific Slider */}
          {settings.mode === 'fixed-note' ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Duration per Note (Unlocked)</span>
                <span className="font-mono text-amber-400">{settings.noteSec}s / note</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.25"
                value={settings.noteSec}
                onChange={(e) => onUpdate({ ...settings, noteSec: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Hum Phase Duration</span>
                <span className="font-mono text-cyan-400">{settings.totalHumSec}s</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="1"
                value={settings.totalHumSec}
                onChange={(e) => onUpdate({ ...settings, totalHumSec: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* 3. Rest / Pause Duration */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Rest / Pause Duration</span>
              <span className="font-mono text-slate-400">{settings.restSec}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={settings.restSec}
              onChange={(e) => onUpdate({ ...settings, restSec: parseFloat(e.target.value) })}
              className="w-full accent-slate-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Apply Custom Timing
        </button>
      </div>
    </div>
  );
};
