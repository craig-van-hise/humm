import React from 'react';
import { generatePianoKeys } from '../utils/pitchMath';

interface PianoKeyboardProps {
  rootNote: string;
  activeNote: string | null;
  onKeyTouch?: (note: string) => void;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  rootNote,
  activeNote,
  onKeyTouch,
}) => {
  const keys = generatePianoKeys(rootNote);

  return (
    <div className="w-full max-w-lg mx-auto my-4 px-2">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          Root ({rootNote})
        </span>
        <span className="text-slate-400">17-Key Touch Keyboard</span>
      </div>

      {/* Piano Keys Container */}
      <div className="relative flex justify-center h-36 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden select-none">
        {keys.map((key) => {
          const isActive = activeNote === key.note;

          if (key.isBlack) {
            return (
              <button
                key={key.note}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onKeyTouch?.(key.note);
                }}
                onClick={() => onKeyTouch?.(key.note)}
                className={`absolute z-10 w-6 sm:w-7 h-20 rounded-b-md transition-all duration-150 transform -translate-x-1/2 ${
                  isActive
                    ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.9)] border-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-t border-slate-700 shadow-lg'
                }`}
                style={{
                  left: `calc(${(keys.filter(k => !k.isBlack && k.midi < key.midi).length / keys.filter(k => !k.isBlack).length) * 100}% + 12px)`,
                }}
              >
                <div className="flex flex-col items-center justify-end h-full pb-1 text-[9px] font-bold text-slate-400">
                  {key.isRoot && (
                    <span className="w-1.5 h-1.5 mb-1 rounded-full bg-cyan-400" />
                  )}
                  <span>{key.note}</span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={key.note}
              onTouchStart={(e) => {
                e.preventDefault();
                onKeyTouch?.(key.note);
              }}
              onClick={() => onKeyTouch?.(key.note)}
              className={`flex-1 h-full mx-[1px] rounded-b-lg flex flex-col justify-end items-center pb-2 transition-all duration-150 border-t ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-400 to-cyan-500 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.8)] border-emerald-300'
                  : key.isRoot
                  ? 'bg-slate-800 border-cyan-500/60 text-cyan-300 hover:bg-slate-700'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {key.isRoot && (
                <span className="w-2 h-2 mb-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              )}
              {key.degreeLabel && !key.isRoot && (
                <span className="text-[10px] font-semibold text-emerald-400 mb-0.5">
                  [{key.degreeLabel}]
                </span>
              )}
              <span className="text-[10px] font-medium tracking-tighter">
                {key.note}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
