export type SessionState = 'idle' | 'inhale' | 'humming' | 'resting';

export type BreathModeId = 'vagal' | 'focus' | 'sinus_no' | 'custom';

export interface BreathMode {
  id: BreathModeId;
  name: string;
  description: string;
  inhaleSec: number;
  humSec: number;
  restSec: number;
  silentRestSec?: number;
}

export interface SequencePool {
  id: string;
  name: string;
  description: string;
  intervalOffsets: number[]; // Relative semitone offsets from root
  intervalDegrees: string[]; // Degree labels e.g. ["1", "b2", "1", "b3", "1"]
}

export interface PianoKey {
  note: string;         // e.g., "C3"
  midi: number;         // e.g., 48
  isBlack: boolean;
  isRoot: boolean;
  degreeLabel?: string; // e.g. "1", "5"
}

export interface AppState {
  rootNote: string;           // Fundamental pitch e.g. "C3"
  octave: number;             // Octave transposition e.g. 3
  droneVolume: number;        // -60 to 0 dB
  guideVolume: number;        // -60 to 0 dB
  isDroneMuted: boolean;
  isGuideMuted: boolean;
  tempoBpm: number;            // 45 to 60 BPM
  selectedBreathMode: BreathModeId;
  inhaleSec: number;
  humSec: number;
  restSec: number;
  sessionState: SessionState;
  activeNote: string | null;   // Real-time playing note e.g. "G3"
  activeDegree: string | null; // Real-time active degree e.g. "5"
  selectedPoolId: string;
}
