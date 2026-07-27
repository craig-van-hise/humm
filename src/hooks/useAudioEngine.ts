import { useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { unlockAudioContext } from '../utils/audioContext';

interface AudioEngineProps {
  rootNote: string;                // e.g., "C3"
  droneOctaveOffset?: number;      // e.g., -1 (-1 Octave default), -2, or 0
  droneRootVol: number;            // 0.0 to 1.0
  droneFifthVol: number;           // 0.0 to 1.0
  guideVol: number;                // 0.0 to 1.0
  isSessionActive?: boolean;
}

export function useAudioEngine({
  rootNote,
  droneOctaveOffset = -1,
  droneRootVol,
  droneFifthVol,
  guideVol,
  isSessionActive = false,
}: AudioEngineProps) {
  // Audio Nodes
  const isEngineInit = useRef(false);
  const guideSynthRef = useRef<Tone.Synth | null>(null);
  
  const droneRootOscRef = useRef<Tone.OmniOscillator<any> | null>(null);
  const droneFifthOscRef = useRef<Tone.OmniOscillator<any> | null>(null);
  
  const droneRootFilterRef = useRef<Tone.Filter | null>(null);
  const droneFifthFilterRef = useRef<Tone.Filter | null>(null);

  const droneRootGainRef = useRef<Tone.Gain | null>(null);
  const droneFifthGainRef = useRef<Tone.Gain | null>(null);
  const guideGainRef = useRef<Tone.Gain | null>(null);

  // 1. Initialize Audio Engine Architecture
  const initEngine = useCallback(async () => {
    if (isEngineInit.current) return;

    await unlockAudioContext();
    await Tone.start();

    // Gain Nodes (Linear Volume 0.0 to 1.0)
    droneRootGainRef.current = new Tone.Gain(droneRootVol).toDestination();
    droneFifthGainRef.current = new Tone.Gain(droneFifthVol).toDestination();
    guideGainRef.current = new Tone.Gain(guideVol).toDestination();

    // Low-Pass Filters for Warmth (400 - 600 Hz cutoff)
    droneRootFilterRef.current = new Tone.Filter(500, "lowpass").connect(droneRootGainRef.current);
    droneFifthFilterRef.current = new Tone.Filter(600, "lowpass").connect(droneFifthGainRef.current);

    // Drone Oscillators
    // Root: Filtered Sawtooth (Warm Humming Pad)
    droneRootOscRef.current = new Tone.OmniOscillator({
      type: "sawtooth",
    }).connect(droneRootFilterRef.current);

    // 5th: Soft Triangle (Subtle Layered Harmonic)
    droneFifthOscRef.current = new Tone.OmniOscillator({
      type: "triangle",
    }).connect(droneFifthFilterRef.current);

    // Guide Tone Synth: Soft Triangle with gentle ADSR envelope
    guideSynthRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.08,
        decay: 0.1,
        sustain: 0.85,
        release: 0.15,
      },
    }).connect(guideGainRef.current);

    isEngineInit.current = true;
  }, [droneRootVol, droneFifthVol, guideVol]);

  // 2. Start Drone Playback
  const startDrone = useCallback(async () => {
    await initEngine();

    const rootMidi = Tone.Frequency(rootNote).toMidi();
    
    // Calculate Drone Pitches based on droneOctaveOffset (-1 default)
    const droneRootMidi = rootMidi + (droneOctaveOffset * 12);
    const droneFifthMidi = droneRootMidi + 7; // 5th tracks drone octave

    const rootFreq = Tone.Frequency(droneRootMidi, "midi").toFrequency();
    const fifthFreq = Tone.Frequency(droneFifthMidi, "midi").toFrequency();

    if (droneRootOscRef.current && droneFifthOscRef.current) {
      droneRootOscRef.current.frequency.setValueAtTime(rootFreq, Tone.now());
      droneFifthOscRef.current.frequency.setValueAtTime(fifthFreq, Tone.now());

      if (droneRootOscRef.current.state !== 'started') {
        droneRootOscRef.current.start();
      }
      if (droneFifthOscRef.current.state !== 'started') {
        droneFifthOscRef.current.start();
      }
    }
  }, [initEngine, rootNote, droneOctaveOffset]);

  // 3. Stop Drone Playback
  const stopDrone = useCallback(() => {
    if (droneRootOscRef.current && droneFifthOscRef.current) {
      droneRootOscRef.current.stop();
      droneFifthOscRef.current.stop();
    }
  }, []);

  // INSTANT STOP: Cuts off both Drone & Guide Tone immediately
  const stopAllAudio = useCallback(() => {
    // 1. Instantly release guide tone envelope
    if (guideSynthRef.current) {
      guideSynthRef.current.triggerRelease(Tone.now());
    }

    // 2. Stop drone oscillators
    if (droneRootOscRef.current && droneFifthOscRef.current) {
      droneRootOscRef.current.stop();
      droneFifthOscRef.current.stop();
    }
  }, []);

  // Sync session state with drone oscillator lifecycle
  useEffect(() => {
    if (isSessionActive) {
      startDrone();
    } else {
      stopAllAudio();
    }
  }, [isSessionActive, startDrone, stopAllAudio]);

  // 4. Play Single Guide Pitch (Unison with target note)
  const playGuidePitch = useCallback((pitch: number | string, durationSec: number = 1) => {
    if (guideSynthRef.current && isEngineInit.current && guideVol > 0) {
      guideSynthRef.current.triggerAttackRelease(pitch, durationSec, Tone.now());
    }
  }, [guideVol]);

  // 5. Dynamic Pitch Updates while Drone is running
  useEffect(() => {
    if (isEngineInit.current && droneRootOscRef.current && droneFifthOscRef.current) {
      const rootMidi = Tone.Frequency(rootNote).toMidi();
      const droneRootMidi = rootMidi + (droneOctaveOffset * 12);
      const droneFifthMidi = droneRootMidi + 7;

      droneRootOscRef.current.frequency.rampTo(Tone.Frequency(droneRootMidi, "midi").toFrequency(), 0.1);
      droneFifthOscRef.current.frequency.rampTo(Tone.Frequency(droneFifthMidi, "midi").toFrequency(), 0.1);
    }
  }, [rootNote, droneOctaveOffset]);

  // 6. Dynamic Volume Adjustments
  useEffect(() => {
    if (droneRootGainRef.current) droneRootGainRef.current.gain.rampTo(droneRootVol, 0.05);
    if (droneFifthGainRef.current) droneFifthGainRef.current.gain.rampTo(droneFifthVol, 0.05);
    if (guideGainRef.current) guideGainRef.current.gain.rampTo(guideVol, 0.05);
  }, [droneRootVol, droneFifthVol, guideVol]);

  // 7. Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        droneRootOscRef.current?.stop();
        droneFifthOscRef.current?.stop();
        droneRootOscRef.current?.dispose();
        droneFifthOscRef.current?.dispose();
        droneRootFilterRef.current?.dispose();
        droneFifthFilterRef.current?.dispose();
        droneRootGainRef.current?.dispose();
        droneFifthGainRef.current?.dispose();
        guideSynthRef.current?.dispose();
        guideGainRef.current?.dispose();
      } catch (err) {
        console.warn('Audio cleanup error:', err);
      }
    };
  }, []);

  return {
    startDrone,
    stopDrone,
    stopAllAudio,
    playGuidePitch,
    playGuideNote: playGuidePitch,
    initEngine,
  };
}
