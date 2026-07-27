import React from 'react';

interface PianoKeyboardProps {
  activeNote: string | null;
  rootNote: string;
  onSelectRoot: (note: string) => void;
}

// 14 White Keys ($F_2$ to $E_4$)
const WHITE_KEYS = ["F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4"];

// 10 Black Keys centered mathematically between white key seams
const BLACK_KEYS = [
  { note: "F#2", whiteIndex: 0 },
  { note: "G#2", whiteIndex: 1 },
  { note: "A#2", whiteIndex: 2 },
  { note: "C#3", whiteIndex: 4 },
  { note: "D#3", whiteIndex: 5 },
  { note: "F#3", whiteIndex: 7 },
  { note: "G#3", whiteIndex: 8 },
  { note: "A#3", whiteIndex: 9 },
  { note: "C#4", whiteIndex: 11 },
  { note: "D#4", whiteIndex: 12 },
];

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNote,
  rootNote,
  onSelectRoot,
}) => {
  const totalWhite = WHITE_KEYS.length;

  return (
    <div className="w-full max-w-lg mx-auto my-3">
      {/* Piano Container */}
      <div className="relative w-full h-36 bg-slate-900 rounded-2xl p-2 border border-slate-800 shadow-inner select-none overflow-hidden">
        {/* 1. White Keys Layer */}
        <div className="flex w-full h-full gap-[2px]">
          {WHITE_KEYS.map((note) => {
            const isRoot = note === rootNote;
            const isActive = note === activeNote;

            return (
              <button
                key={note}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onSelectRoot(note);
                }}
                onClick={() => onSelectRoot(note)}
                className={`flex-1 rounded-b-md flex flex-col justify-end pb-2 items-center transition-colors relative cursor-pointer ${
                  isActive
                    ? "bg-cyan-300 text-slate-950 font-bold border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                    : isRoot
                    ? "bg-sky-100 text-slate-900 font-bold border-2 border-cyan-500"
                    : "bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                {isRoot && <span className="w-2 h-2 rounded-full bg-cyan-500 mb-1" />}
                <span className="text-[11px] font-semibold">{note}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Black Keys Overlay */}
        {BLACK_KEYS.map(({ note, whiteIndex }) => {
          const isRoot = note === rootNote;
          const isActive = note === activeNote;
          const leftPercent = ((whiteIndex + 1) / totalWhite) * 100;

          return (
            <button
              key={note}
              onTouchStart={(e) => {
                e.preventDefault();
                onSelectRoot(note);
              }}
              onClick={() => onSelectRoot(note)}
              style={{
                left: `${leftPercent}%`,
                transform: "translateX(-50%)",
                width: `${(1 / totalWhite) * 65}%`,
              }}
              className={`absolute top-2 h-20 rounded-b-md z-10 flex flex-col justify-end pb-2 items-center transition-colors cursor-pointer ${
                isActive
                  ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.9)]"
                  : isRoot
                  ? "bg-cyan-600 text-white font-bold"
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
