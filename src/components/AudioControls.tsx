import React from 'react';
import { Volume2, Music, Settings } from 'lucide-react';

interface AudioControlsProps {
  droneOctaveOffset: number;
  setDroneOctaveOffset: (offset: number) => void;
  droneRootVol: number;
  setDroneRootVol: (vol: number) => void;
  droneFifthVol: number;
  setDroneFifthVol: (vol: number) => void;
  guideVol: number;
  setGuideVol: (vol: number) => void;
  onOpenToneSettings?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  droneOctaveOffset,
  setDroneOctaveOffset,
  droneRootVol,
  setDroneRootVol,
  droneFifthVol,
  setDroneFifthVol,
  guideVol,
  setGuideVol,
  onOpenToneSettings,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          Acoustic Tone Mixer
        </h3>
        {onOpenToneSettings && (
          <button
            onClick={onOpenToneSettings}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title="Configure Acoustic Tone & Filter Parameters"
            aria-label="Tone Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drone Octave Selector */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-300 font-medium flex justify-between">
          <span>Drone Octave Placement</span>
          <span className="text-[10px] text-cyan-400 font-mono">
            {droneOctaveOffset === -1 ? "-1 Octave (Recommended)" : droneOctaveOffset === -2 ? "-2 Octaves" : "Unison (0)"}
          </span>
        </label>
        
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[
            { label: "-2 Oct", value: -2 },
            { label: "-1 Oct (Default)", value: -1 },
            { label: "Unison (0)", value: 0 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDroneOctaveOffset(opt.value)}
              className={`text-xs py-1 px-2 rounded-md font-medium transition-colors ${
                droneOctaveOffset === opt.value
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider 1: Drone Fundamental (Filtered Sawtooth) */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Drone Fundamental (Warm Pad)</span>
          <span className="font-mono text-cyan-400">{Math.round(droneRootVol * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={droneRootVol}
          onChange={(e) => setDroneRootVol(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Slider 2: Drone Perfect 5th */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Drone Perfect 5th (Harmonic Ground)</span>
          <span className="font-mono text-sky-400">{Math.round(droneFifthVol * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={droneFifthVol}
          onChange={(e) => setDroneFifthVol(parseFloat(e.target.value))}
          className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Slider 3: Guide Tone Pitch (Soft Triangle) */}
      <div className="space-y-1 border-t border-slate-800/60 pt-2">
        <div className="flex justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3 text-amber-400" />
            Guide Tone Melody (Unison)
          </span>
          <span className="font-mono text-amber-400">{Math.round(guideVol * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={guideVol}
          onChange={(e) => setGuideVol(parseFloat(e.target.value))}
          className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
