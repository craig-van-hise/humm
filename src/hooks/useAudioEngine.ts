import { useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { unlockAudioContext } from '../utils/audioContext';
import { DroneSource } from '../types';

const TAMPURA_1_NATIVE_HZ = 138.59; // C#3
const TAMPURA_2_NATIVE_HZ = 136.10; // ~C#3 (flat)

const TRIM_FRONT_SEC = 0.5; // Trim 500ms off front dead space
const TRIM_TAIL_SEC = 3.0;  // Trim 3.0 seconds off tail end decay
const CROSSFADE_SEC = 2.5;  // 2.5-second lush crossfade duration

interface AudioEngineProps {
  rootNote: string;                // e.g., "C3"
  droneOctaveOffset?: number;      // e.g., -1 (-1 Octave default), -2, or 0
  droneSource?: DroneSource;
  droneSampleVol?: number;         // 0.0 to 1.0
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
  droneSource = 'synth',
  droneSampleVol = 0.7,
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
    droneSource,
    droneSampleVol,
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
  const droneSampleGainRef = useRef<Tone.Gain | null>(null);
  const guideGainRef = useRef<Tone.Gain | null>(null);

  // Dual-Player Crossfade Looper Nodes (Tampura 1 & 2)
  const tampura1PlayerARef = useRef<Tone.Player | null>(null);
  const tampura1PlayerBRef = useRef<Tone.Player | null>(null);
  const tampura1GainARef = useRef<Tone.Gain | null>(null);
  const tampura1GainBRef = useRef<Tone.Gain | null>(null);

  const tampura2PlayerARef = useRef<Tone.Player | null>(null);
  const tampura2PlayerBRef = useRef<Tone.Player | null>(null);
  const tampura2GainARef = useRef<Tone.Gain | null>(null);
  const tampura2GainBRef = useRef<Tone.Gain | null>(null);

  const crossfadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize Audio Engine Architecture (Zero Dependencies - Permanently Stable)
  const initEngine = useCallback(async () => {
    if (isEngineInit.current) return;

    await unlockAudioContext();
    await Tone.start();

    const current = propsRef.current;

    // Gain Nodes initialized to actual volume levels on startup
    droneRootGainRef.current = new Tone.Gain(current.droneRootVol).toDestination();
    droneFifthGainRef.current = new Tone.Gain(current.droneFifthVol).toDestination();
    droneSampleGainRef.current = new Tone.Gain(current.droneSampleVol).toDestination();
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

    // Dual Players & Gain Nodes for Tampura 1
    tampura1GainARef.current = new Tone.Gain(1);
    if (droneSampleGainRef.current) tampura1GainARef.current.connect(droneSampleGainRef.current);

    tampura1GainBRef.current = new Tone.Gain(0);
    if (droneSampleGainRef.current) tampura1GainBRef.current.connect(droneSampleGainRef.current);

    tampura1PlayerARef.current = new Tone.Player({
      url: '/342968__iternetcone__tanpura-c.wav',
      loop: false,
      autostart: false,
    });
    if (tampura1GainARef.current) tampura1PlayerARef.current.connect(tampura1GainARef.current);

    tampura1PlayerBRef.current = new Tone.Player({
      url: '/342968__iternetcone__tanpura-c.wav',
      loop: false,
      autostart: false,
    });
    if (tampura1GainBRef.current) tampura1PlayerBRef.current.connect(tampura1GainBRef.current);

    // Dual Players & Gain Nodes for Tampura 2
    tampura2GainARef.current = new Tone.Gain(1);
    if (droneSampleGainRef.current) tampura2GainARef.current.connect(droneSampleGainRef.current);

    tampura2GainBRef.current = new Tone.Gain(0);
    if (droneSampleGainRef.current) tampura2GainBRef.current.connect(droneSampleGainRef.current);

    tampura2PlayerARef.current = new Tone.Player({
      url: '/416766__xavip2p__tampura-13610hz.mp3',
      loop: false,
      autostart: false,
    });
    if (tampura2GainARef.current) tampura2PlayerARef.current.connect(tampura2GainARef.current);

    tampura2PlayerBRef.current = new Tone.Player({
      url: '/416766__xavip2p__tampura-13610hz.mp3',
      loop: false,
      autostart: false,
    });
    if (tampura2GainBRef.current) tampura2PlayerBRef.current.connect(tampura2GainBRef.current);

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

    // Ensure sample buffers are loaded into memory
    await Tone.loaded();

    isEngineInit.current = true;
  }, []);

  // Helper to unconditionally stop all active drones and timers
  const stopDroneInternal = useCallback(() => {
    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }

    try { droneRootOscRef.current?.stop(); } catch {}
    try { droneFifthOscRef.current?.stop(); } catch {}
    try { tampura1PlayerARef.current?.stop(); } catch {}
    try { tampura1PlayerBRef.current?.stop(); } catch {}
    try { tampura2PlayerARef.current?.stop(); } catch {}
    try { tampura2PlayerBRef.current?.stop(); } catch {}
  }, []);

  // 2. Start Drone Playback (Stable Callback)
  const startDrone = useCallback(async () => {
    await initEngine();

    const { rootNote: currentRoot, droneOctaveOffset: currentOctave, droneSource: currentSource } = propsRef.current;

    // Unconditionally stop all active sound sources before starting new source
    stopDroneInternal();

    if (currentSource === 'synth') {
      const rootMidi = Tone.Frequency(currentRoot).toMidi();
      const droneRootMidi = rootMidi + (currentOctave * 12);
      const droneFifthMidi = droneRootMidi + 7;

      const rootFreq = Tone.Frequency(droneRootMidi, "midi").toFrequency();
      const fifthFreq = Tone.Frequency(droneFifthMidi, "midi").toFrequency();

      if (droneRootOscRef.current && droneFifthOscRef.current) {
        droneRootOscRef.current.frequency.setValueAtTime(rootFreq, Tone.now());
        droneFifthOscRef.current.frequency.setValueAtTime(fifthFreq, Tone.now());

        droneRootOscRef.current.start();
        droneFifthOscRef.current.start();
      }
    } else {
      const targetFreq = Tone.Frequency(currentRoot).toFrequency();
      const nativeHz = currentSource === 'tampura-1' ? TAMPURA_1_NATIVE_HZ : TAMPURA_2_NATIVE_HZ;
      const rate = targetFreq / nativeHz;

      const playerA = currentSource === 'tampura-1' ? tampura1PlayerARef.current : tampura2PlayerARef.current;
      const playerB = currentSource === 'tampura-1' ? tampura1PlayerBRef.current : tampura2PlayerBRef.current;
      const gainA = currentSource === 'tampura-1' ? tampura1GainARef.current : tampura2GainARef.current;
      const gainB = currentSource === 'tampura-1' ? tampura1GainBRef.current : tampura2GainBRef.current;

      const startLooper = () => {
        if (!playerA || !playerB || !gainA || !gainB) return;

        const now = Tone.now();
        playerA.playbackRate = rate;
        playerB.playbackRate = rate;

        gainA.gain.setValueAtTime(1, now);
        gainB.gain.setValueAtTime(0, now);

        // Start Voice A from offset 0.0s (beginning of audio track)
        playerA.start(now, 0);

        // Recursive dual-voice ping-pong crossfade scheduler
        const scheduleNextCrossfadeCycle = (currentVoice: 'A' | 'B', isFirst: boolean) => {
          const activePlayer = currentVoice === 'A' ? playerA : playerB;
          const dur = activePlayer.buffer ? activePlayer.buffer.duration : 18;

          const startOffset = isFirst ? 0.0 : TRIM_FRONT_SEC;
          const endOffset = Math.max(startOffset + 3.0, dur - TRIM_TAIL_SEC);
          const playDuration = endOffset - startOffset;

          // Time in real seconds until crossfade should begin
          const timeUntilCrossfadeMs = Math.max(1000, ((playDuration - CROSSFADE_SEC) / rate) * 1000);

          crossfadeTimerRef.current = setTimeout(() => {
            if (!propsRef.current.isSessionActive || propsRef.current.droneSource !== currentSource) return;

            const xfadeNow = Tone.now();
            const nextVoice = currentVoice === 'A' ? 'B' : 'A';
            const outgoingGain = currentVoice === 'A' ? gainA : gainB;
            const incomingGain = currentVoice === 'A' ? gainB : gainA;
            const incomingPlayer = currentVoice === 'A' ? playerB : playerA;

            incomingPlayer.playbackRate = propsRef.current.droneSource === currentSource ? (Tone.Frequency(propsRef.current.rootNote).toFrequency() / nativeHz) : rate;
            
            // Perform smooth 2.5-second crossfade ramp
            incomingGain.gain.setValueAtTime(0, xfadeNow);
            incomingGain.gain.rampTo(1, CROSSFADE_SEC, xfadeNow);
            outgoingGain.gain.setValueAtTime(1, xfadeNow);
            outgoingGain.gain.rampTo(0, CROSSFADE_SEC, xfadeNow);

            // Start incoming voice at trim front offset (0.5s)
            try { incomingPlayer.stop(xfadeNow + CROSSFADE_SEC + 0.2); } catch {}
            incomingPlayer.start(xfadeNow, TRIM_FRONT_SEC);

            scheduleNextCrossfadeCycle(nextVoice, false);
          }, timeUntilCrossfadeMs);
        };

        scheduleNextCrossfadeCycle('A', true);
      };

      if (playerA?.loaded && playerB?.loaded) {
        startLooper();
      } else {
        Tone.loaded().then(() => {
          if (propsRef.current.isSessionActive && propsRef.current.droneSource === currentSource) {
            startLooper();
          }
        });
      }
    }
  }, [initEngine, stopDroneInternal]);

  // 3. Stop Drone Playback
  const stopDrone = useCallback(() => {
    stopDroneInternal();
  }, [stopDroneInternal]);

  // INSTANT STOP: Cuts off both Drone & Guide Tone immediately
  const stopAllAudio = useCallback(() => {
    if (guideSynthRef.current) {
      guideSynthRef.current.triggerRelease(Tone.now());
    }
    stopDroneInternal();
  }, [stopDroneInternal]);

  // Sync session state with drone lifecycle
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
    if (!isEngineInit.current) return;

    if (droneSource === 'synth') {
      if (droneRootOscRef.current && droneFifthOscRef.current) {
        const rootMidi = Tone.Frequency(rootNote).toMidi();
        const droneRootMidi = rootMidi + (droneOctaveOffset * 12);
        const droneFifthMidi = droneRootMidi + 7;

        droneRootOscRef.current.frequency.rampTo(Tone.Frequency(droneRootMidi, "midi").toFrequency(), 0.1);
        droneFifthOscRef.current.frequency.rampTo(Tone.Frequency(droneFifthMidi, "midi").toFrequency(), 0.1);
      }
    } else {
      const targetFreq = Tone.Frequency(rootNote).toFrequency();
      const nativeHz = droneSource === 'tampura-1' ? TAMPURA_1_NATIVE_HZ : TAMPURA_2_NATIVE_HZ;
      const rate = targetFreq / nativeHz;

      const playerA = droneSource === 'tampura-1' ? tampura1PlayerARef.current : tampura2PlayerARef.current;
      const playerB = droneSource === 'tampura-1' ? tampura1PlayerBRef.current : tampura2PlayerBRef.current;
      
      if (playerA && playerA.loaded) playerA.playbackRate = rate;
      if (playerB && playerB.loaded) playerB.playbackRate = rate;
    }
  }, [rootNote, droneOctaveOffset, droneSource]);

  // 6. Handle live switching of droneSource during an active session
  useEffect(() => {
    if (isEngineInit.current && isSessionActive) {
      startDrone();
    }
  }, [droneSource, isSessionActive, startDrone]);

  // 7. Dynamic Volume Adjustments
  useEffect(() => {
    if (!isEngineInit.current) return;
    if (droneRootGainRef.current) droneRootGainRef.current.gain.rampTo(droneRootVol, 0.05);
    if (droneFifthGainRef.current) droneFifthGainRef.current.gain.rampTo(droneFifthVol, 0.05);
    if (droneSampleGainRef.current) droneSampleGainRef.current.gain.rampTo(droneSampleVol, 0.05);
    if (guideGainRef.current) guideGainRef.current.gain.rampTo(guideVol, 0.05);
  }, [droneRootVol, droneFifthVol, droneSampleVol, guideVol]);

  // 8. Dynamic Tone & Filter Adjustments (Direct Mutations to prevent audio dropouts)
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

  // 9. Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (crossfadeTimerRef.current) clearTimeout(crossfadeTimerRef.current);

        droneRootOscRef.current?.stop();
        droneFifthOscRef.current?.stop();
        tampura1PlayerARef.current?.stop();
        tampura1PlayerBRef.current?.stop();
        tampura2PlayerARef.current?.stop();
        tampura2PlayerBRef.current?.stop();

        droneRootOscRef.current?.dispose();
        droneFifthOscRef.current?.dispose();
        tampura1PlayerARef.current?.dispose();
        tampura1PlayerBRef.current?.dispose();
        tampura2PlayerARef.current?.dispose();
        tampura2PlayerBRef.current?.dispose();

        tampura1GainARef.current?.dispose();
        tampura1GainBRef.current?.dispose();
        tampura2GainARef.current?.dispose();
        tampura2GainBRef.current?.dispose();

        droneRootFilterRef.current?.dispose();
        droneFifthFilterRef.current?.dispose();
        guideFilterRef.current?.dispose();

        droneRootGainRef.current?.dispose();
        droneFifthGainRef.current?.dispose();
        droneSampleGainRef.current?.dispose();

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
