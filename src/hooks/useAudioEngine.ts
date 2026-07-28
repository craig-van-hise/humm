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
  droneRootWaveform?: Tone.ToneOscillatorType;
  droneRootFilterFreq?: number;
  droneFifthWaveform?: Tone.ToneOscillatorType;
  droneFifthFilterFreq?: number;
  guideWaveform?: Tone.ToneOscillatorType;
  guideFilterFreq?: number;
}

export function useAudioEngine({
  rootNote,
  droneOctaveOffset = -1,
  droneRootVol,
  droneFifthVol,
  guideVol,
  isSessionActive = false,
  droneRootWaveform = 'sawtooth',
  droneRootFilterFreq = 500,
  droneFifthWaveform = 'triangle',
  droneFifthFilterFreq = 600,
  guideWaveform = 'triangle',
  guideFilterFreq = 1000,
}: AudioEngineProps) {
  // Comprehensive Props Ref to track latest state without causing callback re-creation
  const fullProps = {
    rootNote,
    droneOctaveOffset,
    droneRootVol,
    droneFifthVol,
    guideVol,
    isSessionActive,
    droneRootWaveform,
    droneRootFilterFreq,
    droneFifthWaveform,
    droneFifthFilterFreq,
    guideWaveform,
    guideFilterFreq,
  };

  const propsRef = useRef(fullProps);
  useEffect(() => {
    propsRef.current = fullProps;
  });

  // Audio Nodes
  const isEngineInit = useRef(false);
  const guideSynthRef = useRef<Tone.Synth | null>(null);
  const guideFilterRef = useRef<Tone.Filter | null>(null);
  
  const droneRootOscRef = useRef<Tone.OmniOscillator<any> | null>(null);
  const droneFifthOscRef = useRef<Tone.OmniOscillator<any> | null>(null);
  
  const droneRootFilterRef = useRef<Tone.Filter | null>(null);
  const droneFifthFilterRef = useRef<Tone.Filter | null>(null);

  const droneRootGainRef = useRef<Tone.Gain | null>(null);
  const droneFifthGainRef = useRef<Tone.Gain | null>(null);
  const guideGainRef = useRef<Tone.Gain | null>(null);

  // 1. Initialize Audio Engine Architecture (Zero Dependencies - Permanently Stable)
  const initEngine = useCallback(async () => {
    if (isEngineInit.current) return;

    await unlockAudioContext();
    await Tone.start();

    const current = propsRef.current;

    // Gain Nodes initialized to actual volume levels on startup (fixes silent initialization bug)
    droneRootGainRef.current = new Tone.Gain(current.droneRootVol).toDestination();
    droneFifthGainRef.current = new Tone.Gain(current.droneFifthVol).toDestination();
    guideGainRef.current = new Tone.Gain(current.guideVol).toDestination();

    // Low-Pass Filters for Warmth
    droneRootFilterRef.current = new Tone.Filter(current.droneRootFilterFreq, "lowpass").connect(droneRootGainRef.current);
    droneFifthFilterRef.current = new Tone.Filter(current.droneFifthFilterFreq, "lowpass").connect(droneFifthGainRef.current);
    guideFilterRef.current = new Tone.Filter(current.guideFilterFreq, "lowpass").connect(guideGainRef.current);

    // Drone Oscillators
    droneRootOscRef.current = new Tone.OmniOscillator({
      type: current.droneRootWaveform as any,
    }).connect(droneRootFilterRef.current);

    droneFifthOscRef.current = new Tone.OmniOscillator({
      type: current.droneFifthWaveform as any,
    }).connect(droneFifthFilterRef.current);

    // Guide Tone Synth
    guideSynthRef.current = new Tone.Synth({
      oscillator: { type: current.guideWaveform as any },
      envelope: {
        attack: 0.08,
        decay: 0.1,
        sustain: 0.85,
        release: 0.15,
      },
    }).connect(guideFilterRef.current);

    isEngineInit.current = true;
  }, []);

  // 2. Start Drone Playback (Stable Callback)
  const startDrone = useCallback(async () => {
    await initEngine();

    const { rootNote: currentRoot, droneOctaveOffset: currentOctave } = propsRef.current;

    const rootMidi = Tone.Frequency(currentRoot).toMidi();
    
    // Calculate Drone Pitches based on droneOctaveOffset
    const droneRootMidi = rootMidi + (currentOctave * 12);
    const droneFifthMidi = droneRootMidi + 7;

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
  }, [initEngine]);

  // 3. Stop Drone Playback
  const stopDrone = useCallback(() => {
    if (droneRootOscRef.current && droneFifthOscRef.current) {
      droneRootOscRef.current.stop();
      droneFifthOscRef.current.stop();
    }
  }, []);

  // INSTANT STOP: Cuts off both Drone & Guide Tone immediately
  const stopAllAudio = useCallback(() => {
    if (guideSynthRef.current) {
      guideSynthRef.current.triggerRelease(Tone.now());
    }

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
    const { guideVol: currentGuideVol } = propsRef.current;
    if (guideSynthRef.current && isEngineInit.current && currentGuideVol > 0) {
      guideSynthRef.current.triggerAttackRelease(pitch, durationSec, Tone.now());
    }
  }, []);

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
    if (!isEngineInit.current) return;
    if (droneRootGainRef.current) droneRootGainRef.current.gain.rampTo(droneRootVol, 0.05);
    if (droneFifthGainRef.current) droneFifthGainRef.current.gain.rampTo(droneFifthVol, 0.05);
    if (guideGainRef.current) guideGainRef.current.gain.rampTo(guideVol, 0.05);
  }, [droneRootVol, droneFifthVol, guideVol]);

  // 7. Dynamic Tone & Filter Adjustments (Direct Mutations to prevent audio dropouts)
  useEffect(() => {
    if (!isEngineInit.current) return;
    
    if (droneRootOscRef.current && (droneRootOscRef.current as any).type !== droneRootWaveform) {
      (droneRootOscRef.current as any).type = droneRootWaveform;
    }
    if (droneRootFilterRef.current) {
      droneRootFilterRef.current.frequency.rampTo(droneRootFilterFreq, 0.1);
    }
    
    if (droneFifthOscRef.current && (droneFifthOscRef.current as any).type !== droneFifthWaveform) {
      (droneFifthOscRef.current as any).type = droneFifthWaveform;
    }
    if (droneFifthFilterRef.current) {
      droneFifthFilterRef.current.frequency.rampTo(droneFifthFilterFreq, 0.1);
    }
    
    if (guideSynthRef.current && (guideSynthRef.current as any).oscillator.type !== guideWaveform) {
      (guideSynthRef.current as any).oscillator.type = guideWaveform;
    }
    if (guideFilterRef.current) {
      guideFilterRef.current.frequency.rampTo(guideFilterFreq, 0.1);
    }
  }, [droneRootWaveform, droneRootFilterFreq, droneFifthWaveform, droneFifthFilterFreq, guideWaveform, guideFilterFreq]);

  // 8. Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        droneRootOscRef.current?.stop();
        droneFifthOscRef.current?.stop();
        droneRootOscRef.current?.dispose();
        droneFifthOscRef.current?.dispose();
        droneRootFilterRef.current?.dispose();
        droneFifthFilterRef.current?.dispose();
        guideFilterRef.current?.dispose();
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
