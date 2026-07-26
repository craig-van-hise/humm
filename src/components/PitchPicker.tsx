import React from 'react';
import { isSinusResonancePitch, getFormattedFreq } from '../utils/pitchMath';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface PitchPickerProps {
  rootNote: string;
  onSelectRoot: (note: string) => void;
}

const COMMON_PITCHES = ['C2', 'G2', 'A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'E4'];

export const PitchPicker: React.FC<PitchPickerProps> = ({
  rootNote,
  onSelectRoot,
}) => {
  const isResonanceZone = isSinusResonancePitch(rootNote);

  const transposeOctave = (delta: number) => {
    const match = rootNote.match(/^([A-G]#?)(-?\d+)$/);
    if (!match) return;
    const [, name, octaveStr] = match;
    const newOctave = Math.max(2, Math.min(5, parseInt(octaveStr, 10) + delta));
    onSelectRoot(`${name}${newOctave}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto my-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Fundamental Pitch Calibration
          </h3>
          <p className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            Root: <span className="text-cyan-400 text-base">{rootNote}</span>
            <span className="text-xs font-normal text-slate-400">
              ({getFormattedFreq(rootNote)})
            </span>
          </p>
        </div>

        {/* Octave Adjust Buttons */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => transposeOctave(-1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Transpose Down Octave"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-1">Octave</span>
          <button
            onClick={() => transposeOctave(1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Transpose Up Octave"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Peak Resonance Highlight Banner */}
      {isResonanceZone && (
        <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          <span>
            <strong>Peak Sinus NO Zone (130-150 Hz):</strong> Maximum paranasal nitric oxide release target.
          </span>
        </div>
      )}

      {/* Pitch Selector Buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {COMMON_PITCHES.map((pitch) => {
          const isSelected = rootNote === pitch;
          const isRes = isSinusResonancePitch(pitch);

          return (
            <button
              key={pitch}
              onClick={() => onSelectRoot(pitch)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 border ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-[1.03]'
                  : isRes
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div>{pitch}</div>
              <div className="text-[9px] font-normal opacity-70">
                {getFormattedFreq(pitch)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
