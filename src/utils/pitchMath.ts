import { PianoKey } from '../types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Converts a MIDI note number to Frequency (Hz)
 */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Converts Note Name (e.g. "C3", "F#4") to MIDI number
 */
export function noteToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default C4
  const [, name, octaveStr] = match;
  const noteIndex = NOTE_NAMES.indexOf(name);
  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + noteIndex;
}

/**
 * Converts MIDI number to Note Name (e.g. 48 -> "C3")
 */
export function midiToNoteName(midi: number): string {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Checks if pitch falls in peak Sinus Nitric Oxide (NO) resonance window (130 - 150 Hz, approx C3 to D3)
 */
export function isSinusResonancePitch(noteName: string): boolean {
  const midi = noteToMidi(noteName);
  const freq = midiToFreq(midi);
  return freq >= 128 && freq <= 152; // C3 ~130.8Hz, D3 ~146.8Hz
}

/**
 * Gets frequency formatted string e.g. "130.8 Hz"
 */
export function getFormattedFreq(noteName: string): string {
  const midi = noteToMidi(noteName);
  return `${Math.round(midiToFreq(midi))} Hz`;
}

/**
 * Calculates note from root note + semitone offset
 */
export function offsetNote(rootNote: string, semitones: number): string {
  const rootMidi = noteToMidi(rootNote);
  return midiToNoteName(rootMidi + semitones);
}

/**
 * Generates a 17-key keyboard layout centered around root or standard range C2 to E4 (MIDI 36 to 64)
 */
export function generatePianoKeys(rootNote: string): PianoKey[] {
  const rootMidi = noteToMidi(rootNote);
  // Keyboard range: starting 7 semitones below root up to 10 semitones above root (17 keys total)
  const startMidi = Math.max(36, rootMidi - 7); // Minimum C2
  const totalKeys = 17;
  const keys: PianoKey[] = [];

  for (let i = 0; i < totalKeys; i++) {
    const midi = startMidi + i;
    const note = midiToNoteName(midi);
    const noteIndex = ((midi % 12) + 12) % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteIndex);
    const isRoot = midi === rootMidi;

    let degreeLabel: string | undefined;
    if (isRoot) degreeLabel = '1';
    else if (midi === rootMidi + 7) degreeLabel = '5';
    else if (midi === rootMidi + 4) degreeLabel = '3';
    else if (midi === rootMidi + 3) degreeLabel = 'b3';
    else if (midi === rootMidi + 1) degreeLabel = 'b2';

    keys.push({
      note,
      midi,
      isBlack,
      isRoot,
      degreeLabel,
    });
  }

  return keys;
}
