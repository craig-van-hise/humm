import React, { useState } from 'react';
import { isSinusResonancePitch, getFormattedFreq } from '../utils/pitchMath';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface PianoKeyboardProps {
  activeNote: string | null;
  rootNote: string;
  onSelectRoot: (note: string) => void;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getOctave = (note: string) => {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  return match ? parseInt(match[2], 10) : 3;
};

export const generateKeysForOctave = (baseOctave: number) => {
  const keys = [];
  for (let i = 0; i < 2; i++) {
    const oct = baseOctave + i;
    for (const note of NOTES) {
      keys.push(`${note}${oct}`);
    }
  }
  return keys;
};

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNote,
  rootNote,
  onSelectRoot,
}) => {
  // Local state for visual octave layout (decoupled from rootNote pitch selection)
  const [keyboardOctave, setKeyboardOctave] = useState(() => getOctave(rootNote));

  const shiftKeyboardOctave = (delta: number) => {
    setKeyboardOctave((prev) => Math.max(2, Math.min(5, prev + delta)));
  };

  const keys = generateKeysForOctave(keyboardOctave);
  const isResonanceZone = isSinusResonancePitch(rootNote);

  // Split into white and black key structures for rendering
  const whiteKeys: { note: string; index: number }[] = [];
  const blackKeys: { note: string; whiteIndex: number }[] = [];

  let whiteIndex = -1;
  keys.forEach((note) => {
    const isBlack = note.includes('#');
    if (!isBlack) {
      whiteIndex++;
      whiteKeys.push({ note, index: whiteIndex });
    } else {
      blackKeys.push({ note, whiteIndex });
    }
  });

  const totalWhite = whiteKeys.length; // Always 14

  return (
    <div className="w-full max-w-lg mx-auto my-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md select-none" data-testid="piano-keyboard">
      {/* Header with Pitch Info & Octave Controls */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Fundamental Pitch Calibration
          </h3>
          <p className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            Root: <span className="text-cyan-400 text-base" data-testid="root-note-display">{rootNote}</span>
            <span className="text-xs font-normal text-slate-400">
              ({getFormattedFreq(rootNote)})
            </span>
          </p>
        </div>

        {/* Octave Adjust Buttons (View-only transpose) */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => shiftKeyboardOctave(-1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Shift Visual Keyboard Octave Down"
            aria-label="Octave Down"
            data-testid="octave-down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-1" data-testid="keyboard-octave-display">
            Octave {keyboardOctave}
          </span>
          <button
            onClick={() => shiftKeyboardOctave(1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Shift Visual Keyboard Octave Up"
            aria-label="Octave Up"
            data-testid="octave-up"
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

      {/* 2-Octave Static Piano Keyboard Container */}
      <div className="relative w-full h-36 bg-slate-950 rounded-xl p-2 border border-slate-800 shadow-inner overflow-hidden">
        {/* White Keys Layer */}
        <div className="flex w-full h-full gap-[2px]">
          {whiteKeys.map(({ note }) => {
            const isRoot = note === rootNote;
            const isActive = note === activeNote;

            return (
              <button
                key={note}
                data-note={note}
                data-testid={`key-${note}`}
                onClick={() => onSelectRoot(note)}
                className={`flex-1 rounded-b-md flex flex-col justify-end pb-2 items-center transition-colors relative cursor-pointer ${
                  isActive
                    ? "bg-amber-300 text-slate-950 font-bold border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                    : isRoot
                    ? "bg-cyan-100 text-slate-900 font-bold border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    : "bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                {isRoot && <span className="w-2 h-2 rounded-full bg-cyan-500 mb-1" />}
                <span className="text-[10px] font-semibold">{note}</span>
              </button>
            );
          })}
        </div>

        {/* Black Keys Layer */}
        {blackKeys.map(({ note, whiteIndex }) => {
          const isRoot = note === rootNote;
          const isActive = note === activeNote;
          const leftPercent = ((whiteIndex + 1) / totalWhite) * 100;

          return (
            <button
              key={note}
              data-note={note}
              data-testid={`key-${note}`}
              onClick={() => onSelectRoot(note)}
              style={{
                left: `${leftPercent}%`,
                transform: "translateX(-50%)",
                width: `${(1 / totalWhite) * 65}%`,
              }}
              className={`absolute top-2 h-20 rounded-b-md z-10 flex flex-col justify-end pb-2 items-center transition-colors cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  : isRoot
                  ? "bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {isRoot && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mb-1" />}
              <span className="text-[9px] font-medium">{note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
