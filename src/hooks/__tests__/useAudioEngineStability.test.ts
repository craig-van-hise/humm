import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioEngine } from '../useAudioEngine';
import * as Tone from 'tone';

const filterRampMock = vi.fn();
const gainRampMock = vi.fn();

vi.mock('tone', () => {
  function MockSynth(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.oscillator = { type: 'triangle' };
    this.triggerAttackRelease = vi.fn();
    this.triggerRelease = vi.fn();
    this.dispose = vi.fn();
  }

  function MockGain(this: any) {
    this.toDestination = vi.fn().mockReturnThis();
    this.gain = { rampTo: gainRampMock };
    this.dispose = vi.fn();
  }

  function MockFilter(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.frequency = { rampTo: filterRampMock };
    this.dispose = vi.fn();
  }

  function MockOmniOscillator(this: any) {
    this.connect = vi.fn().mockReturnThis();
    this.start = vi.fn();
    this.stop = vi.fn();
    this.type = 'sawtooth';
    this.dispose = vi.fn();
    this.frequency = { setValueAtTime: vi.fn(), rampTo: vi.fn() };
  }

  function MockFrequency() {
    return {
      toMidi: () => 60,
      toFrequency: () => 261.63,
    };
  }

  return {
    now: () => 0,
    Synth: vi.fn().mockImplementation(function(this: any) { MockSynth.call(this); }),
    Gain: vi.fn().mockImplementation(function(this: any) { MockGain.call(this); }),
    Filter: vi.fn().mockImplementation(function(this: any) { MockFilter.call(this); }),
    OmniOscillator: vi.fn().mockImplementation(function(this: any) { MockOmniOscillator.call(this); }),
    Frequency: MockFrequency,
    start: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../../utils/audioContext', () => ({
  unlockAudioContext: vi.fn().mockResolvedValue(true),
}));

describe('useAudioEngine PRP #12 - Reference Equality & Callback Stability', () => {
  it('maintains reference equality for callback functions when state changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useAudioEngine(props),
      {
        initialProps: {
          rootNote: 'C3',
          droneRootVol: 0.6,
          droneFifthVol: 0.35,
          guideVol: 0.9,
          droneRootWaveform: 'sawtooth' as Tone.ToneOscillatorType,
          droneRootFilterFreq: 500,
          droneFifthWaveform: 'triangle' as Tone.ToneOscillatorType,
          droneFifthFilterFreq: 600,
          guideWaveform: 'triangle' as Tone.ToneOscillatorType,
          guideFilterFreq: 1000,
        },
      }
    );

    const initialStartDrone = result.current.startDrone;
    const initialStopAllAudio = result.current.stopAllAudio;
    const initialPlayGuidePitch = result.current.playGuidePitch;
    const initialInitEngine = result.current.initEngine;

    // Rerender with changed volume, filter, waveform, and root note props
    rerender({
      rootNote: 'D3',
      droneRootVol: 0.8,
      droneFifthVol: 0.5,
      guideVol: 1.0,
      droneRootWaveform: 'square' as Tone.ToneOscillatorType,
      droneRootFilterFreq: 1200,
      droneFifthWaveform: 'sine' as Tone.ToneOscillatorType,
      droneFifthFilterFreq: 1400,
      guideWaveform: 'sawtooth' as Tone.ToneOscillatorType,
      guideFilterFreq: 1800,
    });

    // Verify callback identities remain strictly identical across re-renders
    expect(result.current.startDrone).toBe(initialStartDrone);
    expect(result.current.stopAllAudio).toBe(initialStopAllAudio);
    expect(result.current.playGuidePitch).toBe(initialPlayGuidePitch);
    expect(result.current.initEngine).toBe(initialInitEngine);
  });
});
