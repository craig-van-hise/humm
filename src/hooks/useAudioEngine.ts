import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { midiToFreq, noteToMidi, offsetNote } from '../utils/pitchMath';
import { unlockAudioContext } from '../utils/audioContext';

interface UseAudioEngineOptions {
  rootNote: string;
  droneVolume: number; // dB (-60 to 0)
  guideVolume: number; // dB (-60 to 0)
  isDroneMuted: boolean;
  isGuideMuted: boolean;
}

export function useAudioEngine({
  rootNote,
  droneVolume,
  guideVolume,
  isDroneMuted,
  isGuideMuted,
}: UseAudioEngineOptions) {
  const isInitialized = useRef<boolean>(false);
  const droneFilterRef = useRef<Tone.Filter | null>(null);
  const droneGainRef = useRef<Tone.Volume | null>(null);
  const droneOsc1Ref = useRef<Tone.Oscillator | null>(null);
  const droneOsc2Ref = useRef<Tone.Oscillator | null>(null);

  const guideGainRef = useRef<Tone.Volume | null>(null);
  const guideSynthRef = useRef<Tone.Synth | null>(null);

  // Initialize synth chain once
  const initEngine = useCallback(async () => {
    if (isInitialized.current) return;

    await unlockAudioContext();

    // 1. Drone Chain (Low-pass filter <400Hz, Triangle/Sine blend)
    const filter = new Tone.Filter({
      frequency: 380,
      type: 'lowpass',
      rolloff: -24,
    });

    const droneVolumeNode = new Tone.Volume(isDroneMuted ? -Infinity : droneVolume);

    const rootFreq = midiToFreq(noteToMidi(rootNote));
    const fifthFreq = midiToFreq(noteToMidi(rootNote) + 7);

    // Root oscillator (triangle wave)
    const osc1 = new Tone.Oscillator({
      frequency: rootFreq,
      type: 'triangle',
      volume: -4,
    });

    // 5th oscillator (sine wave, warmer)
    const osc2 = new Tone.Oscillator({
      frequency: fifthFreq,
      type: 'sine',
      volume: -8,
    });

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneVolumeNode);
    droneVolumeNode.toDestination();

    osc1.start();
    osc2.start();

    droneFilterRef.current = filter;
    droneGainRef.current = droneVolumeNode;
    droneOsc1Ref.current = osc1;
    droneOsc2Ref.current = osc2;

    // 2. Guide Tone Synth (Sine wave with smooth ADSR)
    const guideVolumeNode = new Tone.Volume(isGuideMuted ? -Infinity : guideVolume);
    const guideSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.08,
        decay: 0.1,
        sustain: 0.85,
        release: 0.15,
      },
    });

    guideSynth.connect(guideVolumeNode);
    guideVolumeNode.toDestination();

    guideGainRef.current = guideVolumeNode;
    guideSynthRef.current = guideSynth;

    isInitialized.current = true;
  }, [rootNote, droneVolume, guideVolume, isDroneMuted, isGuideMuted]);

  // Update drone frequencies when rootNote changes
  useEffect(() => {
    if (!isInitialized.current) return;
    const rootFreq = midiToFreq(noteToMidi(rootNote));
    const fifthFreq = midiToFreq(noteToMidi(rootNote) + 7);

    if (droneOsc1Ref.current) {
      droneOsc1Ref.current.frequency.rampTo(rootFreq, 0.1);
    }
    if (droneOsc2Ref.current) {
      droneOsc2Ref.current.frequency.rampTo(fifthFreq, 0.1);
    }
  }, [rootNote]);

  // Update volume levels dynamically
  useEffect(() => {
    if (droneGainRef.current) {
      droneGainRef.current.volume.value = isDroneMuted ? -Infinity : droneVolume;
    }
  }, [droneVolume, isDroneMuted]);

  useEffect(() => {
    if (guideGainRef.current) {
      guideGainRef.current.volume.value = isGuideMuted ? -Infinity : guideVolume;
    }
  }, [guideVolume, isGuideMuted]);

  // Play a single note (used by interactive keyboard or pacer)
  const playGuideNote = useCallback(
    async (noteName: string, durationSec: number = 1) => {
      if (!isInitialized.current) {
        await initEngine();
      }
      await unlockAudioContext();

      if (guideSynthRef.current && !isGuideMuted) {
        guideSynthRef.current.triggerAttackRelease(noteName, durationSec);
      }
    },
    [initEngine, isGuideMuted]
  );

  // Play continuous note onset
  const startGuideNote = useCallback(
    async (noteName: string) => {
      if (!isInitialized.current) {
        await initEngine();
      }
      await unlockAudioContext();

      if (guideSynthRef.current && !isGuideMuted) {
        guideSynthRef.current.triggerAttack(noteName);
      }
    },
    [initEngine, isGuideMuted]
  );

  // Release playing note
  const stopGuideNote = useCallback(() => {
    if (guideSynthRef.current) {
      guideSynthRef.current.triggerRelease();
    }
  }, []);

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      try {
        droneOsc1Ref.current?.stop();
        droneOsc2Ref.current?.stop();
        droneOsc1Ref.current?.dispose();
        droneOsc2Ref.current?.dispose();
        droneFilterRef.current?.dispose();
        droneGainRef.current?.dispose();
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
    startGuideNote,
    stopGuideNote,
  };
}
