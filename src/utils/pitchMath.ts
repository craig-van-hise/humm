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
 * Converts a degree label (e.g., "1", "b2", "3", "5") to semitone offset from root
 */
export function degreeToSemitones(degreeStr: string): number {
  const cleaned = degreeStr.trim().toLowerCase();
  const isSubTonic = cleaned.endsWith('v') || cleaned.startsWith('v');
  const core = cleaned.replace(/v/g, '');

  let semitones = 0;
  switch (core) {
    case '1': semitones = 0; break;
    case 'b2': case 'b-2': case 'flat2': semitones = 1; break;
    case '2': semitones = 2; break;
    case '#2': case 'b3': case 'flat3': semitones = 3; break;
    case '3': semitones = 4; break;
    case '4': semitones = 5; break;
    case '#4': case 'b5': case 'flat5': semitones = 6; break;
    case '5': semitones = 7; break;
    case '#5': case 'b6': case 'flat6': semitones = 8; break;
    case '6': semitones = 9; break;
    case 'b7': case 'flat7': semitones = 10; break;
    case '7': semitones = 11; break;
    case '8': case '15': semitones = 12; break;
    default: {
      const parsed = parseInt(core, 10);
      semitones = isNaN(parsed) ? 0 : Math.max(0, Math.min(12, parsed - 1));
      break;
    }
  }

  if (isSubTonic && semitones > 0) {
    return semitones - 12;
  }
  return semitones;
}

/**
 * Converts a degree label to note name relative to rootNote
 */
export function degreeToNoteName(rootNote: string, degree: string): string {
  const semitones = degreeToSemitones(degree);
  return offsetNote(rootNote, semitones);
}

/**
 * Converts a degree label to frequency in Hz relative to rootNote
 */
export function degreeToFrequency(rootNote: string, degree: string): number {
  const noteName = degreeToNoteName(rootNote, degree);
  return midiToFreq(noteToMidi(noteName));
}

