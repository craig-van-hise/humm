import React from 'react';
import { Radio, Music } from 'lucide-react';

interface AudioControlsProps {
  droneRootVol: number;
  setDroneRootVol: (val: number) => void;
  droneFifthVol: number;
  setDroneFifthVol: (val: number) => void;
  guideVol: number;
  setGuideVol: (val: number) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  droneRootVol,
  setDroneRootVol,
  droneFifthVol,
  setDroneFifthVol,
  guideVol,
  setGuideVol,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto my-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Audio Mix Controls
      </h3>

      {/* Drone Root (1) Slider */}
      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Drone Fundamental (1)
          </span>
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

      {/* Drone Fifth (5) Slider */}
      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            Drone Perfect Fifth (5)
          </span>
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

      {/* Guide Pitch Slider */}
      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            Guide Tone Melody
          </span>
          <span className="font-mono text-emerald-400">{Math.round(guideVol * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={guideVol}
          onChange={(e) => setGuideVol(parseFloat(e.target.value))}
          className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
