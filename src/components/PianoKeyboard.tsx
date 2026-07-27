import React from 'react';

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const isBlackMidi = (midi: number): boolean => [1, 3, 6, 8, 10].includes(midi % 12);

const midiToNoteName = (midi: number): string => {
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
};

const noteNameToMidi = (noteStr: string): number => {
  const match = noteStr.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 48; // Default C3
  const [, name, octStr] = match;
  const noteIdx = NOTE_NAMES.indexOf(name);
  const oct = parseInt(octStr, 10);
  return (oct + 1) * 12 + noteIdx;
};

export const PianoKeyboard = ({
  activeNote,
  rootNote,
  onSelectRoot,
}: {
  activeNote: string | null;
  rootNote: string;
  onSelectRoot: (note: string) => void;
}) => {
  const rootMidi = noteNameToMidi(rootNote);

  // 1. Find start MIDI note (exactly 2 white keys below root)
  let whiteCountBelow = 0;
  let startMidi = rootMidi;
  while (whiteCountBelow < 2 && startMidi > 0) {
    startMidi--;
    if (!isBlackMidi(startMidi)) {
      whiteCountBelow++;
    }
  }

  // 2. Build 14 white keys starting from startMidi
  const whiteKeys: { note: string; midi: number }[] = [];
  let currMidi = startMidi;
  while (whiteKeys.length < 14) {
    if (!isBlackMidi(currMidi)) {
      whiteKeys.push({ note: midiToNoteName(currMidi), midi: currMidi });
    }
    currMidi++;
  }

  const endMidi = whiteKeys[whiteKeys.length - 1].midi;
  const totalWhite = whiteKeys.length;

  // 3. Map black keys that fall between startMidi and endMidi
  const blackKeys: { note: string; midi: number; whiteIndex: number }[] = [];
  let currentWhiteIdx = -1;

  for (let m = startMidi; m <= endMidi; m++) {
    if (!isBlackMidi(m)) {
      currentWhiteIdx++;
    } else if (currentWhiteIdx >= 0) {
      blackKeys.push({
        note: midiToNoteName(m),
        midi: m,
        whiteIndex: currentWhiteIdx,
      });
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto my-3 select-none">
      <div className="relative w-full h-36 bg-slate-900 rounded-xl p-2 border border-slate-800 shadow-inner select-none overflow-hidden">
        {/* White Keys Layer */}
        <div className="flex w-full h-full gap-[2px]">
          {whiteKeys.map(({ note, midi }) => {
            const isRoot = note === rootNote;
            const isActive = note === activeNote;

            return (
              <button
                key={midi}
                onClick={() => onSelectRoot(note)}
                className={`flex-1 rounded-b-md flex flex-col justify-end pb-2 items-center transition-colors relative cursor-pointer ${
                  isActive
                    ? "bg-amber-300 text-slate-950 font-bold border-2 border-amber-400"
                    : isRoot
                    ? "bg-cyan-100 text-slate-900 font-bold border-2 border-cyan-500"
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
        {blackKeys.map(({ note, midi, whiteIndex }) => {
          const isRoot = note === rootNote;
          const isActive = note === activeNote;
          const leftPercent = ((whiteIndex + 1) / totalWhite) * 100;

          return (
            <button
              key={midi}
              onClick={() => onSelectRoot(note)}
              style={{
                left: `${leftPercent}%`,
                transform: "translateX(-50%)",
                width: `${(1 / totalWhite) * 65}%`,
              }}
              className={`absolute top-2 h-20 rounded-b-md z-10 flex flex-col justify-end pb-2 items-center transition-colors cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-slate-950 font-bold shadow-lg"
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
