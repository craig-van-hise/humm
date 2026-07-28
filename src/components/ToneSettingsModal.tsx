import React from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import * as Tone from 'tone';

export interface ToneSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  droneRootWaveform: Tone.ToneOscillatorType;
  setDroneRootWaveform: (val: Tone.ToneOscillatorType) => void;
  droneRootFilterFreq: number;
  setDroneRootFilterFreq: (val: number) => void;
  droneFifthWaveform: Tone.ToneOscillatorType;
  setDroneFifthWaveform: (val: Tone.ToneOscillatorType) => void;
  droneFifthFilterFreq: number;
  setDroneFifthFilterFreq: (val: number) => void;
  guideWaveform: Tone.ToneOscillatorType;
  setGuideWaveform: (val: Tone.ToneOscillatorType) => void;
  guideFilterFreq: number;
  setGuideFilterFreq: (val: number) => void;
  onResetDefaults?: () => void;
}

const WAVEFORM_OPTIONS: { label: string; value: Tone.ToneOscillatorType }[] = [
  { label: 'Sawtooth', value: 'sawtooth' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Sine', value: 'sine' },
  { label: 'Square', value: 'square' },
];

export const ToneSettingsModal: React.FC<ToneSettingsModalProps> = ({
  isOpen,
  onClose,
  droneRootWaveform,
  setDroneRootWaveform,
  droneRootFilterFreq,
  setDroneRootFilterFreq,
  droneFifthWaveform,
  setDroneFifthWaveform,
  droneFifthFilterFreq,
  setDroneFifthFilterFreq,
  guideWaveform,
  setGuideWaveform,
  guideFilterFreq,
  setGuideFilterFreq,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Acoustic Tone & Filter Settings
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Drone Fundamental Settings */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
            Drone Fundamental (Root)
          </h4>
          
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Waveform</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {WAVEFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDroneRootWaveform(opt.value)}
                  className={`text-[11px] py-1 px-1 rounded font-medium transition-colors cursor-pointer ${
                    droneRootWaveform === opt.value
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Filter Cutoff Frequency</span>
              <span className="font-mono text-cyan-400">{droneRootFilterFreq} Hz</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="25"
              value={droneRootFilterFreq}
              onChange={(e) => setDroneRootFilterFreq(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* 2. Drone 5th Settings */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wide">
            Drone Harmonic (Perfect 5th)
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Waveform</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {WAVEFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDroneFifthWaveform(opt.value)}
                  className={`text-[11px] py-1 px-1 rounded font-medium transition-colors cursor-pointer ${
                    droneFifthWaveform === opt.value
                      ? 'bg-sky-400 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Filter Cutoff Frequency</span>
              <span className="font-mono text-sky-400">{droneFifthFilterFreq} Hz</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="25"
              value={droneFifthFilterFreq}
              onChange={(e) => setDroneFifthFilterFreq(parseFloat(e.target.value))}
              className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Guide Melody Waveform & Filter */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
            Guide Tone Melody Synth
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Waveform</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {WAVEFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGuideWaveform(opt.value)}
                  className={`text-[11px] py-1 px-1 rounded font-medium transition-colors cursor-pointer ${
                    guideWaveform === opt.value
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Filter Cutoff Frequency</span>
              <span className="font-mono text-amber-400">{guideFilterFreq} Hz</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="25"
              value={guideFilterFreq}
              onChange={(e) => setGuideFilterFreq(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Reset & Apply Actions */}
        <div className="flex gap-2">
          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
