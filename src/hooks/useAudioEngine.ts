import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { midiToFreq, noteToMidi } from '../utils/pitchMath';
import { unlockAudioContext } from '../utils/audioContext';

interface UseAudioEngineOptions {
  rootNote: string;
  isSessionActive: boolean;
  droneRootVol: number;  // 0 to 1
  droneFifthVol: number; // 0 to 1
  guideVol: number;      // 0 to 1
}

function volToDb(vol: number): number {
  if (vol <= 0.001) return -Infinity;
  return 20 * Math.log10(vol);
}

export function useAudioEngine({
  rootNote,
  isSessionActive,
  droneRootVol,
  droneFifthVol,
  guideVol,
}: UseAudioEngineOptions) {
  const isInitialized = useRef<boolean>(false);
  const droneFilterRef = useRef<Tone.Filter | null>(null);
  
  const droneRootGainRef = useRef<Tone.Volume | null>(null);
  const droneFifthGainRef = useRef<Tone.Volume | null>(null);
  const droneOscRootRef = useRef<Tone.Oscillator | null>(null);
  const droneOscFifthRef = useRef<Tone.Oscillator | null>(null);

  const guideGainRef = useRef<Tone.Volume | null>(null);
  const guideSynthRef = useRef<Tone.Synth | null>(null);

  // Initialize synth chain
  const initEngine = useCallback(async () => {
    if (isInitialized.current) return;

    await unlockAudioContext();

    // Lowpass filter <380Hz
    const filter = new Tone.Filter({
      frequency: 380,
      type: 'lowpass',
      rolloff: -24,
    });

    const rootFreq = midiToFreq(noteToMidi(rootNote));
    const fifthFreq = midiToFreq(noteToMidi(rootNote) + 7);

    // Root drone volume node & oscillator
    const droneRootVolNode = new Tone.Volume(volToDb(droneRootVol));
    const oscRoot = new Tone.Oscillator({
      frequency: rootFreq,
      type: 'triangle',
    });

    // 5th drone volume node & oscillator
    const droneFifthVolNode = new Tone.Volume(volToDb(droneFifthVol));
    const oscFifth = new Tone.Oscillator({
      frequency: fifthFreq,
      type: 'sine',
    });

    oscRoot.connect(droneRootVolNode);
    droneRootVolNode.connect(filter);

    oscFifth.connect(droneFifthVolNode);
    droneFifthVolNode.connect(filter);

    filter.toDestination();

    droneFilterRef.current = filter;
    droneRootGainRef.current = droneRootVolNode;
    droneFifthGainRef.current = droneFifthVolNode;
    droneOscRootRef.current = oscRoot;
    droneOscFifthRef.current = oscFifth;

    // Guide Tone Lead Synth
    const guideVolNode = new Tone.Volume(volToDb(guideVol));
    const guideSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.08,
        decay: 0.1,
        sustain: 0.85,
        release: 0.15,
      },
    });

    guideSynth.connect(guideVolNode);
    guideVolNode.toDestination();

    guideGainRef.current = guideVolNode;
    guideSynthRef.current = guideSynth;

    isInitialized.current = true;
  }, [rootNote, droneRootVol, droneFifthVol, guideVol]);

  // Start / Stop drone oscillators based on session activity
  useEffect(() => {
    if (!isInitialized.current) return;

    if (isSessionActive) {
      if (droneOscRootRef.current?.state !== 'started') {
        droneOscRootRef.current?.start();
      }
      if (droneOscFifthRef.current?.state !== 'started') {
        droneOscFifthRef.current?.start();
      }
    } else {
      droneOscRootRef.current?.stop();
      droneOscFifthRef.current?.stop();
    }
  }, [isSessionActive]);

  // Update drone frequencies when rootNote changes
  useEffect(() => {
    if (!isInitialized.current) return;
    const rootFreq = midiToFreq(noteToMidi(rootNote));
    const fifthFreq = midiToFreq(noteToMidi(rootNote) + 7);

    if (droneOscRootRef.current) {
      droneOscRootRef.current.frequency.rampTo(rootFreq, 0.1);
    }
    if (droneOscFifthRef.current) {
      droneOscFifthRef.current.frequency.rampTo(fifthFreq, 0.1);
    }
  }, [rootNote]);

  // Dynamic Volume Controls
  useEffect(() => {
    if (droneRootGainRef.current) {
      droneRootGainRef.current.volume.value = volToDb(droneRootVol);
    }
  }, [droneRootVol]);

  useEffect(() => {
    if (droneFifthGainRef.current) {
      droneFifthGainRef.current.volume.value = volToDb(droneFifthVol);
    }
  }, [droneFifthVol]);

  useEffect(() => {
    if (guideGainRef.current) {
      guideGainRef.current.volume.value = volToDb(guideVol);
    }
  }, [guideVol]);

  // Trigger guide note
  const playGuideNote = useCallback(
    async (noteName: string, durationSec: number = 1) => {
      if (!isInitialized.current) {
        await initEngine();
      }
      await unlockAudioContext();

      if (guideSynthRef.current && guideVol > 0) {
        guideSynthRef.current.triggerAttackRelease(noteName, durationSec);
      }
    },
    [initEngine, guideVol]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        droneOscRootRef.current?.stop();
        droneOscFifthRef.current?.stop();
        droneOscRootRef.current?.dispose();
        droneOscFifthRef.current?.dispose();
        droneFilterRef.current?.dispose();
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
    initEngine,
    playGuideNote,
  };
}
