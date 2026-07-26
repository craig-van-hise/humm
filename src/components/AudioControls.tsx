import React from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Music } from 'lucide-react';

interface AudioControlsProps {
  isSessionActive: boolean;
  onToggleSession: () => void;
  droneVolume: number;
  onDroneVolumeChange: (val: number) => void;
  guideVolume: number;
  onGuideVolumeChange: (val: number) => void;
  isDroneMuted: boolean;
  onToggleDroneMute: () => void;
  isGuideMuted: boolean;
  onToggleGuideMute: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isSessionActive,
  onToggleSession,
  droneVolume,
  onDroneVolumeChange,
  guideVolume,
  onGuideVolumeChange,
  isDroneMuted,
  onToggleDroneMute,
  isGuideMuted,
  onToggleGuideMute,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto my-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-lg shadow-2xl space-y-4">
      {/* Primary Play / Pause Button */}
      <button
        onClick={onToggleSession}
        className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 border ${
          isSessionActive
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
            : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:brightness-110'
        }`}
      >
        {isSessionActive ? (
          <>
            <Pause className="w-6 h-6 fill-current" />
            PAUSE SESSION
          </>
        ) : (
          <>
            <Play className="w-6 h-6 fill-current" />
            START RESONANCE SESSION
          </>
        )}
      </button>

      {/* Volume & Mute Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        {/* Drone Volume */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Background Drone
            </span>
            <button
              onClick={onToggleDroneMute}
              className={`p-1 rounded transition-colors ${
                isDroneMuted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Drone Mute"
            >
              {isDroneMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="range"
            min="-40"
            max="0"
            step="1"
            disabled={isDroneMuted}
            value={isDroneMuted ? -40 : droneVolume}
            onChange={(e) => onDroneVolumeChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Guide Volume */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              Guide Tone Pitch
            </span>
            <button
              onClick={onToggleGuideMute}
              className={`p-1 rounded transition-colors ${
                isGuideMuted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Guide Mute"
            >
              {isGuideMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="range"
            min="-40"
            max="0"
            step="1"
            disabled={isGuideMuted}
            value={isGuideMuted ? -40 : guideVolume}
            onChange={(e) => onGuideVolumeChange(Number(e.target.value))}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
